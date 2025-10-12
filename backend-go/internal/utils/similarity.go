package utils

import (
	"math"
	"regexp"
	"strings"

	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/models"
)

// DocumentVector represents TF-IDF vector for a product
type DocumentVector struct {
	ProductID string
	Vector    map[string]float64
	Magnitude float64
}

// ProductSimilarity represents similarity score between products
type ProductSimilarity struct {
	ProductID  string  `json:"productId"`
	Similarity float64 `json:"similarity"`
}

// Tokenize text into words (lowercase, no punctuation)
func Tokenize(text string) []string {
	// Convert to lowercase
	text = strings.ToLower(text)

	// Remove punctuation
	reg := regexp.MustCompile(`[^\w\s]`)
	text = reg.ReplaceAllString(text, " ")

	// Split and filter
	tokens := strings.Fields(text)
	result := make([]string, 0, len(tokens))
	for _, token := range tokens {
		if len(token) > 0 {
			result = append(result, token)
		}
	}
	return result
}

// CalculateTF calculates term frequency for a document
func CalculateTF(tokens []string) map[string]float64 {
	tf := make(map[string]float64)
	totalTokens := float64(len(tokens))

	// Count occurrences
	for _, token := range tokens {
		tf[token]++
	}

	// Normalize by document length
	for term := range tf {
		tf[term] = tf[term] / totalTokens
	}

	return tf
}

// CalculateIDF calculates inverse document frequency
func CalculateIDF(documents [][]string) map[string]float64 {
	idf := make(map[string]float64)
	totalDocs := float64(len(documents))

	// Count documents containing each term
	docFrequency := make(map[string]int)
	for _, doc := range documents {
		uniqueTerms := make(map[string]bool)
		for _, term := range doc {
			uniqueTerms[term] = true
		}
		for term := range uniqueTerms {
			docFrequency[term]++
		}
	}

	// Calculate IDF
	for term, df := range docFrequency {
		idf[term] = math.Log(totalDocs / float64(df))
	}

	return idf
}

// CalculateTFIDF calculates TF-IDF vector for a document
func CalculateTFIDF(tf map[string]float64, idf map[string]float64) map[string]float64 {
	tfidf := make(map[string]float64)

	for term, termFreq := range tf {
		idfValue := idf[term]
		tfidf[term] = termFreq * idfValue
	}

	return tfidf
}

// VectorMagnitude calculates the magnitude of a vector
func VectorMagnitude(vector map[string]float64) float64 {
	sumSquares := 0.0
	for _, value := range vector {
		sumSquares += value * value
	}
	return math.Sqrt(sumSquares)
}

// CosineSimilarity calculates cosine similarity between two vectors
func CosineSimilarity(vec1, vec2 map[string]float64) float64 {
	dotProduct := 0.0

	// Calculate dot product
	for term, value1 := range vec1 {
		if value2, exists := vec2[term]; exists {
			dotProduct += value1 * value2
		}
	}

	mag1 := VectorMagnitude(vec1)
	mag2 := VectorMagnitude(vec2)

	if mag1 == 0 || mag2 == 0 {
		return 0
	}

	return dotProduct / (mag1 * mag2)
}

// BuildProductVectors builds TF-IDF vectors for all products
func BuildProductVectors(products []models.Product) map[string]DocumentVector {
	// Prepare documents
	documents := make([][]string, len(products))
	for i, p := range products {
		text := p.Title + " " + strings.Join(p.Tags, " ")
		documents[i] = Tokenize(text)
	}

	// Calculate IDF
	idf := CalculateIDF(documents)

	// Build vectors
	vectors := make(map[string]DocumentVector)

	for i, product := range products {
		tokens := documents[i]
		tf := CalculateTF(tokens)
		tfidf := CalculateTFIDF(tf, idf)

		vectors[product.ID] = DocumentVector{
			ProductID: product.ID,
			Vector:    tfidf,
			Magnitude: VectorMagnitude(tfidf),
		}
	}

	return vectors
}

// FindSimilarProducts finds similar products using cosine similarity
func FindSimilarProducts(targetProductID string, products []models.Product, limit int) []ProductSimilarity {
	vectors := BuildProductVectors(products)
	targetVector, exists := vectors[targetProductID]

	if !exists {
		return []ProductSimilarity{}
	}

	similarities := make([]ProductSimilarity, 0)

	for productID, vector := range vectors {
		if productID == targetProductID {
			continue
		}

		similarity := CosineSimilarity(targetVector.Vector, vector.Vector)
		similarities = append(similarities, ProductSimilarity{
			ProductID:  productID,
			Similarity: similarity,
		})
	}

	// Sort by similarity (descending)
	for i := 0; i < len(similarities)-1; i++ {
		for j := i + 1; j < len(similarities); j++ {
			if similarities[j].Similarity > similarities[i].Similarity {
				similarities[i], similarities[j] = similarities[j], similarities[i]
			}
		}
	}

	// Return top results
	if limit > len(similarities) {
		limit = len(similarities)
	}
	return similarities[:limit]
}

// CalculateQuerySimilarity calculates similarity score for search query
func CalculateQuerySimilarity(query string, product models.Product) float64 {
	queryTokens := Tokenize(query)
	productText := product.Title + " " + strings.Join(product.Tags, " ")
	productTokens := Tokenize(productText)

	// Simple overlap coefficient
	querySet := make(map[string]bool)
	for _, token := range queryTokens {
		querySet[token] = true
	}

	productSet := make(map[string]bool)
	for _, token := range productTokens {
		productSet[token] = true
	}

	matches := 0
	for token := range querySet {
		if productSet[token] {
			matches++
		}
	}

	if len(querySet) == 0 {
		return 0
	}

	return float64(matches) / float64(len(querySet))
}
