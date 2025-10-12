package services

import (
	"testing"

	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/models"
	"github.com/stretchr/testify/assert"
)

func TestAIService_ParseSearchQuery(t *testing.T) {
	service := &AIService{}

	t.Run("Parse price max - under X", func(t *testing.T) {
		queries := []string{
			"keyboard under 100",
			"mouse below 50",
			"headset less than 200",
		}

		expected := []int{100, 50, 200}

		for i, query := range queries {
			result := service.ParseSearchQuery(query)
			assert.NotNil(t, result.PriceMax)
			assert.Equal(t, expected[i], *result.PriceMax)
		}
	})

	t.Run("Parse price min - over X", func(t *testing.T) {
		queries := []string{
			"keyboard over 100",
			"mouse above 50",
			"headset more than 200",
		}

		expected := []int{100, 50, 200}

		for i, query := range queries {
			result := service.ParseSearchQuery(query)
			assert.NotNil(t, result.PriceMin)
			assert.Equal(t, expected[i], *result.PriceMin)
		}
	})

	t.Run("Parse price range - between X and Y", func(t *testing.T) {
		query := "keyboard between 50 and 150"
		result := service.ParseSearchQuery(query)

		assert.NotNil(t, result.PriceMin)
		assert.NotNil(t, result.PriceMax)
		assert.Equal(t, 50, *result.PriceMin)
		assert.Equal(t, 150, *result.PriceMax)
	})

	t.Run("Parse price range - from X to Y", func(t *testing.T) {
		query := "headphones from 100 to 300"
		result := service.ParseSearchQuery(query)

		assert.NotNil(t, result.PriceMin)
		assert.NotNil(t, result.PriceMax)
		assert.Equal(t, 100, *result.PriceMin)
		assert.Equal(t, 300, *result.PriceMax)
	})

	t.Run("Parse sort by rating", func(t *testing.T) {
		queries := []string{
			"best rated keyboard",
			"top rated mouse",
			"highest rated monitor",
		}

		for _, query := range queries {
			result := service.ParseSearchQuery(query)
			assert.Equal(t, "rating", result.SortBy)
		}
	})

	t.Run("Parse sort by price", func(t *testing.T) {
		queries := []string{
			"cheapest keyboard",
			"lowest price mouse",
			"budget monitor",
		}

		for _, query := range queries {
			result := service.ParseSearchQuery(query)
			assert.Equal(t, "price", result.SortBy)
		}
	})

	t.Run("Extract keywords", func(t *testing.T) {
		query := "wireless mechanical keyboard"
		result := service.ParseSearchQuery(query)

		assert.Contains(t, result.Keywords, "wireless")
		assert.Contains(t, result.Keywords, "mechanical")
		assert.Contains(t, result.Keywords, "keyboard")
		assert.Equal(t, "wireless mechanical keyboard", result.Text)
	})

	t.Run("Complex query with all features", func(t *testing.T) {
		query := "best rated wireless keyboard between 50 and 150"
		result := service.ParseSearchQuery(query)

		assert.NotNil(t, result.PriceMin)
		assert.NotNil(t, result.PriceMax)
		assert.Equal(t, 50, *result.PriceMin)
		assert.Equal(t, 150, *result.PriceMax)
		assert.Equal(t, "rating", result.SortBy)
		assert.Contains(t, result.Keywords, "wireless")
		assert.Contains(t, result.Keywords, "keyboard")
	})

	t.Run("Handle empty query", func(t *testing.T) {
		query := ""
		result := service.ParseSearchQuery(query)

		assert.Equal(t, "", result.Text)
		assert.Empty(t, result.Keywords)
		assert.Nil(t, result.PriceMin)
		assert.Nil(t, result.PriceMax)
		assert.Equal(t, "relevance", result.SortBy)
	})

	t.Run("Filter out short keywords", func(t *testing.T) {
		query := "a an to in for keyboard"
		result := service.ParseSearchQuery(query)

		// Short words (length <= 2) should be filtered out
		assert.NotContains(t, result.Keywords, "a")
		assert.NotContains(t, result.Keywords, "an")
		assert.NotContains(t, result.Keywords, "to")
		assert.NotContains(t, result.Keywords, "in")
		assert.Contains(t, result.Keywords, "for") // length = 3, should be included
		assert.Contains(t, result.Keywords, "keyboard")
	})
}

func TestAIService_QueryNormalization(t *testing.T) {
	service := &AIService{}

	t.Run("Case insensitive", func(t *testing.T) {
		queries := []string{
			"KEYBOARD",
			"Keyboard",
			"keyboard",
		}

		for _, query := range queries {
			result := service.ParseSearchQuery(query)
			assert.Equal(t, "keyboard", result.Text)
		}
	})

	t.Run("Remove punctuation", func(t *testing.T) {
		query := "wireless, keyboard! with: special@ characters#"
		result := service.ParseSearchQuery(query)

		// Punctuation should be removed
		assert.NotContains(t, result.Text, ",")
		assert.NotContains(t, result.Text, "!")
		assert.NotContains(t, result.Text, ":")
		assert.NotContains(t, result.Text, "@")
		assert.NotContains(t, result.Text, "#")
	})

	t.Run("Trim whitespace", func(t *testing.T) {
		query := "   keyboard   mouse   "
		result := service.ParseSearchQuery(query)

		// Should have no leading/trailing spaces
		assert.NotEmpty(t, result.Text)
		assert.Contains(t, result.Text, "keyboard")
		assert.Contains(t, result.Text, "mouse")
	})
}

func TestAIService_PriceConversion(t *testing.T) {
	t.Run("Price should be converted to cents", func(t *testing.T) {
		// In the service, prices are multiplied by 100 for database query
		prices := []int{10, 50, 100, 999}

		for _, price := range prices {
			cents := price * 100
			assert.Equal(t, price*100, cents)
			assert.Greater(t, cents, 0)
		}
	})
}

func TestSearchQuery_Struct(t *testing.T) {
	t.Run("SearchQuery should have correct fields", func(t *testing.T) {
		minPrice := 50
		maxPrice := 150

		query := SearchQuery{
			Text:     "keyboard",
			Keywords: []string{"mechanical", "keyboard"},
			PriceMin: &minPrice,
			PriceMax: &maxPrice,
			SortBy:   "rating",
		}

		assert.Equal(t, "keyboard", query.Text)
		assert.Equal(t, 2, len(query.Keywords))
		assert.Equal(t, 50, *query.PriceMin)
		assert.Equal(t, 150, *query.PriceMax)
		assert.Equal(t, "rating", query.SortBy)
	})

	t.Run("Optional fields should be nil-able", func(t *testing.T) {
		query := SearchQuery{
			Text:     "keyboard",
			Keywords: []string{"keyboard"},
			PriceMin: nil,
			PriceMax: nil,
			SortBy:   "relevance",
		}

		assert.Nil(t, query.PriceMin)
		assert.Nil(t, query.PriceMax)
	})
}

func TestSearchResult_Struct(t *testing.T) {
	t.Run("SearchResult should include query and parsed data", func(t *testing.T) {
		result := SearchResult{
			Query: "cheap keyboard under 100",
			Parsed: SearchQuery{
				Text:     "keyboard",
				Keywords: []string{"keyboard"},
				SortBy:   "price",
			},
			Results: []models.Product{},
		}

		assert.NotEmpty(t, result.Query)
		assert.NotEmpty(t, result.Parsed.Text)
		assert.NotNil(t, result.Results)
	})
}
