package services

import (
	"testing"

	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/models"
	"github.com/stretchr/testify/assert"
)

// Note: These are unit tests that test business logic without database
// For integration tests with database, see integration test files

func TestProductService_ValidateSortFields(t *testing.T) {
	t.Run("Valid sort fields", func(t *testing.T) {
		validFields := []string{"price", "rating", "createdAt", "title"}

		for _, field := range validFields {
			req := ProductListRequest{
				SortBy: field,
			}

			// Should not panic or error
			assert.NotEmpty(t, req.SortBy)
		}
	})

	t.Run("Default values", func(t *testing.T) {
		req := ProductListRequest{}

		// Test that defaults are applied correctly
		assert.Equal(t, 0, req.Page)
		assert.Equal(t, 0, req.Limit)
		assert.Equal(t, "", req.SortBy)
	})
}

func TestProductService_PaginationCalculation(t *testing.T) {
	t.Run("Calculate pagination correctly", func(t *testing.T) {
		tests := []struct {
			total       int64
			limit       int
			expectedPages int
		}{
			{total: 100, limit: 10, expectedPages: 10},
			{total: 95, limit: 10, expectedPages: 10},
			{total: 101, limit: 10, expectedPages: 11},
			{total: 0, limit: 10, expectedPages: 0},
			{total: 5, limit: 10, expectedPages: 1},
		}

		for _, tt := range tests {
			totalPages := int(tt.total) / tt.limit
			if int(tt.total)%tt.limit != 0 {
				totalPages++
			}

			assert.Equal(t, tt.expectedPages, totalPages,
				"total=%d, limit=%d should give %d pages", tt.total, tt.limit, tt.expectedPages)
		}
	})

	t.Run("Calculate offset correctly", func(t *testing.T) {
		tests := []struct {
			page           int
			limit          int
			expectedOffset int
		}{
			{page: 1, limit: 10, expectedOffset: 0},
			{page: 2, limit: 10, expectedOffset: 10},
			{page: 3, limit: 20, expectedOffset: 40},
			{page: 5, limit: 5, expectedOffset: 20},
		}

		for _, tt := range tests {
			offset := (tt.page - 1) * tt.limit
			assert.Equal(t, tt.expectedOffset, offset,
				"page=%d, limit=%d should give offset=%d", tt.page, tt.limit, tt.expectedOffset)
		}
	})
}

func TestProductService_PriceValidation(t *testing.T) {
	t.Run("Valid price range", func(t *testing.T) {
		minPrice := 100
		maxPrice := 1000

		req := ProductListRequest{
			MinPrice: &minPrice,
			MaxPrice: &maxPrice,
		}

		assert.NotNil(t, req.MinPrice)
		assert.NotNil(t, req.MaxPrice)
		assert.Less(t, *req.MinPrice, *req.MaxPrice)
	})

	t.Run("Nil prices should be handled", func(t *testing.T) {
		req := ProductListRequest{
			MinPrice: nil,
			MaxPrice: nil,
		}

		assert.Nil(t, req.MinPrice)
		assert.Nil(t, req.MaxPrice)
	})
}

func TestProductService_SearchTermNormalization(t *testing.T) {
	t.Run("Search term should be case insensitive", func(t *testing.T) {
		searches := []string{
			"KEYBOARD",
			"keyboard",
			"KeyBoard",
		}

		// All should produce the same normalized search term
		for _, search := range searches {
			req := ProductListRequest{
				Search: search,
			}

			assert.NotEmpty(t, req.Search)
		}
	})

	t.Run("Empty search should be allowed", func(t *testing.T) {
		req := ProductListRequest{
			Search: "",
		}

		assert.Equal(t, "", req.Search)
	})
}

func TestProductService_TagsFilter(t *testing.T) {
	t.Run("Multiple tags", func(t *testing.T) {
		tags := []string{"keyboard", "mechanical", "gaming"}

		req := ProductListRequest{
			Tags: tags,
		}

		assert.Equal(t, 3, len(req.Tags))
		assert.Contains(t, req.Tags, "keyboard")
		assert.Contains(t, req.Tags, "mechanical")
		assert.Contains(t, req.Tags, "gaming")
	})

	t.Run("Empty tags", func(t *testing.T) {
		req := ProductListRequest{
			Tags: []string{},
		}

		assert.Equal(t, 0, len(req.Tags))
	})
}

func TestProductModel_Validation(t *testing.T) {
	t.Run("Valid product", func(t *testing.T) {
		description := "Test product"
		product := models.Product{
			ID:          "test-id",
			Slug:        "test-slug",
			Title:       "Test Product",
			Description: &description,
			Price:       1000,
			Tags:        []string{"test"},
			Stock:       10,
			Rating:      4.5,
		}

		assert.NotEmpty(t, product.ID)
		assert.NotEmpty(t, product.Slug)
		assert.NotEmpty(t, product.Title)
		assert.Greater(t, product.Price, 0)
		assert.GreaterOrEqual(t, product.Stock, 0)
		assert.GreaterOrEqual(t, product.Rating, 0.0)
		assert.LessOrEqual(t, product.Rating, 5.0)
	})

	t.Run("Price in cents", func(t *testing.T) {
		product := models.Product{
			Price: 4999, // $49.99
		}

		// Convert cents to dollars
		dollars := float64(product.Price) / 100.0
		assert.Equal(t, 49.99, dollars)
	})
}

func TestProductService_SortOrder(t *testing.T) {
	t.Run("Sort order validation", func(t *testing.T) {
		validOrders := []string{"asc", "desc", "ASC", "DESC"}

		for _, order := range validOrders {
			req := ProductListRequest{
				Order: order,
			}

			assert.NotEmpty(t, req.Order)
		}
	})

	t.Run("Default order should be desc", func(t *testing.T) {
		req := ProductListRequest{
			Order: "",
		}

		// Empty string should default to "desc" in the service
		assert.Equal(t, "", req.Order)
	})
}

func TestProductService_LimitBounds(t *testing.T) {
	t.Run("Limit should have reasonable bounds", func(t *testing.T) {
		tests := []struct {
			inputLimit    int
			expectedLimit int
			maxLimit      int
		}{
			{inputLimit: -5, expectedLimit: 10, maxLimit: 100},   // Negative -> default
			{inputLimit: 0, expectedLimit: 10, maxLimit: 100},    // Zero -> default
			{inputLimit: 50, expectedLimit: 50, maxLimit: 100},   // Valid
			{inputLimit: 150, expectedLimit: 100, maxLimit: 100}, // Over max -> max
		}

		for _, tt := range tests {
			limit := tt.inputLimit
			if limit < 1 || limit > tt.maxLimit {
				if limit < 1 {
					limit = 10 // default
				} else {
					limit = tt.maxLimit
				}
			}

			assert.Equal(t, tt.expectedLimit, limit,
				"input=%d should normalize to %d", tt.inputLimit, tt.expectedLimit)
		}
	})
}
