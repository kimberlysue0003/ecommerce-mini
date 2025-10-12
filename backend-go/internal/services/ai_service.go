package services

import (
	"regexp"
	"sort"
	"strings"

	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/config"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/models"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
	"gorm.io/gorm"
)

// AIService handles AI-powered search and recommendations
type AIService struct {
	db *gorm.DB
}

// NewAIService creates a new AI service instance
func NewAIService(db *gorm.DB) *AIService {
	return &AIService{db: db}
}

// SearchQuery represents parsed search query
type SearchQuery struct {
	Text     string   `json:"text,omitempty"`
	Keywords []string `json:"keywords,omitempty"`
	PriceMin *int     `json:"priceMin,omitempty"`
	PriceMax *int     `json:"priceMax,omitempty"`
	SortBy   string   `json:"sortBy"`
}

// SearchResult represents AI search response
type SearchResult struct {
	Query   string        `json:"query"`
	Parsed  SearchQuery   `json:"parsed"`
	Results []models.Product `json:"results"`
}

// ParseSearchQuery parses natural language search query
func (s *AIService) ParseSearchQuery(query string) SearchQuery {
	lowerQuery := strings.ToLower(strings.TrimSpace(query))

	result := SearchQuery{
		SortBy: "relevance",
	}

	// Price extraction patterns
	maxPattern := regexp.MustCompile(`(?:under|below|less than|max|maximum)\s*\$?(\d+)`)
	minPattern := regexp.MustCompile(`(?:over|above|more than|min|minimum)\s*\$?(\d+)`)
	rangePattern := regexp.MustCompile(`(?:between|from)?\s*\$?(\d+)\s*(?:and|to|-)\s*\$?(\d+)`)

	textQuery := lowerQuery

	// Extract price range
	if rangeMatch := rangePattern.FindStringSubmatch(lowerQuery); rangeMatch != nil {
		min := utils.ParseInt(rangeMatch[1])
		max := utils.ParseInt(rangeMatch[2])
		result.PriceMin = &min
		result.PriceMax = &max
		textQuery = strings.Replace(textQuery, rangeMatch[0], "", 1)
	} else {
		if maxMatch := maxPattern.FindStringSubmatch(lowerQuery); maxMatch != nil {
			max := utils.ParseInt(maxMatch[1])
			result.PriceMax = &max
			textQuery = strings.Replace(textQuery, maxMatch[0], "", 1)
		}

		if minMatch := minPattern.FindStringSubmatch(lowerQuery); minMatch != nil {
			min := utils.ParseInt(minMatch[1])
			result.PriceMin = &min
			textQuery = strings.Replace(textQuery, minMatch[0], "", 1)
		}
	}

	// Extract sorting preference
	ratingPattern := regexp.MustCompile(`best.*rat(?:ed|ing)|top.*rat(?:ed|ing)|highest.*rat(?:ed|ing)`)
	pricePattern := regexp.MustCompile(`cheap(?:est)?|lowest.*price|budget`)

	if ratingPattern.MatchString(lowerQuery) {
		result.SortBy = "rating"
		textQuery = ratingPattern.ReplaceAllString(textQuery, "")
	} else if pricePattern.MatchString(lowerQuery) {
		result.SortBy = "price"
		textQuery = pricePattern.ReplaceAllString(textQuery, "")
	}

	// Clean up and extract keywords
	reg := regexp.MustCompile(`[^\w\s]`)
	cleanedText := reg.ReplaceAllString(textQuery, " ")
	cleanedText = strings.Join(strings.Fields(cleanedText), " ")

	if cleanedText != "" {
		result.Text = cleanedText
		words := strings.Fields(cleanedText)
		for _, w := range words {
			if len(w) > 2 {
				result.Keywords = append(result.Keywords, w)
			}
		}
	}

	return result
}

// SearchProducts performs AI-powered product search
func (s *AIService) SearchProducts(query string, limit int) (*SearchResult, error) {
	parsedQuery := s.ParseSearchQuery(query)

	// Build query
	db := s.db.Model(&models.Product{})

	if parsedQuery.Text != "" {
		// Search in title and description
		searchTerm := "%" + parsedQuery.Text + "%"
		db = db.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", searchTerm, searchTerm)
	}

	if parsedQuery.PriceMin != nil {
		db = db.Where("price >= ?", *parsedQuery.PriceMin*100)
	}
	if parsedQuery.PriceMax != nil {
		db = db.Where("price <= ?", *parsedQuery.PriceMax*100)
	}

	// Fetch products (get more for better ranking)
	var products []models.Product
	err := db.Limit(limit * 2).Find(&products).Error
	if err != nil {
		return nil, err
	}

	// Calculate relevance scores
	if parsedQuery.Text != "" {
		type ScoredProduct struct {
			Product models.Product
			Score   float64
		}

		scoredProducts := make([]ScoredProduct, len(products))
		for i, product := range products {
			relevance := utils.CalculateQuerySimilarity(parsedQuery.Text, product)
			normalizedRating := float64(product.Rating) / 5.0
			normalizedPrice := 1.0 - (float64(product.Price) / 300000.0)

			// Combined score: 50% relevance, 30% rating, 20% price
			score := relevance*0.5 + normalizedRating*0.3 + normalizedPrice*0.2

			scoredProducts[i] = ScoredProduct{
				Product: product,
				Score:   score,
			}
		}

		// Sort by score
		sort.Slice(scoredProducts, func(i, j int) bool {
			return scoredProducts[i].Score > scoredProducts[j].Score
		})

		products = make([]models.Product, len(scoredProducts))
		for i, sp := range scoredProducts {
			products[i] = sp.Product
		}
	} else {
		// Sort by preference if no text query
		if parsedQuery.SortBy == "rating" {
			sort.Slice(products, func(i, j int) bool {
				return products[i].Rating > products[j].Rating
			})
		} else if parsedQuery.SortBy == "price" {
			sort.Slice(products, func(i, j int) bool {
				return products[i].Price < products[j].Price
			})
		}
	}

	// Return top results
	if len(products) > limit {
		products = products[:limit]
	}

	return &SearchResult{
		Query:   query,
		Parsed:  parsedQuery,
		Results: products,
	}, nil
}

// GetSimilarProducts finds similar products using TF-IDF
func (s *AIService) GetSimilarProducts(productID string, limit int) ([]models.Product, error) {
	// Get all products
	var allProducts []models.Product
	err := s.db.Find(&allProducts).Error
	if err != nil {
		return nil, err
	}

	// Find similar products
	similarities := utils.FindSimilarProducts(productID, allProducts, limit)

	// Extract product IDs
	productIDs := make([]string, len(similarities))
	for i, sim := range similarities {
		productIDs[i] = sim.ProductID
	}

	// Fetch and return similar products
	var products []models.Product
	err = s.db.Where("id IN ?", productIDs).Find(&products).Error
	if err != nil {
		return nil, err
	}

	// Sort by similarity score
	sort.Slice(products, func(i, j int) bool {
		scoreI := 0.0
		scoreJ := 0.0
		for _, sim := range similarities {
			if sim.ProductID == products[i].ID {
				scoreI = sim.Similarity
			}
			if sim.ProductID == products[j].ID {
				scoreJ = sim.Similarity
			}
		}
		return scoreI > scoreJ
	})

	return products, nil
}

// GetPopularProducts returns popular products based on rating
func (s *AIService) GetPopularProducts(limit int) ([]models.Product, error) {
	var products []models.Product
	err := s.db.Order("rating DESC, stock DESC").Limit(limit).Find(&products).Error
	if err != nil {
		return nil, err
	}

	return products, nil
}

// GetAIService returns a global AI service instance
func GetAIService() *AIService {
	return NewAIService(config.DB)
}
