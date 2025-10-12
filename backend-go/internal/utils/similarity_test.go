package utils

import (
	"testing"

	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/models"
	"github.com/stretchr/testify/assert"
)

func TestTokenize(t *testing.T) {
	t.Run("Basic tokenization", func(t *testing.T) {
		text := "Hello World! This is a TEST."
		tokens := Tokenize(text)

		expected := []string{"hello", "world", "this", "is", "a", "test"}
		assert.Equal(t, expected, tokens)
	})

	t.Run("Remove punctuation", func(t *testing.T) {
		text := "Hello, world! How are you?"
		tokens := Tokenize(text)

		expected := []string{"hello", "world", "how", "are", "you"}
		assert.Equal(t, expected, tokens)
	})

	t.Run("Handle empty string", func(t *testing.T) {
		text := ""
		tokens := Tokenize(text)

		assert.Empty(t, tokens)
	})
}

func TestCalculateTF(t *testing.T) {
	t.Run("Calculate term frequency", func(t *testing.T) {
		tokens := []string{"hello", "world", "hello", "test"}
		tf := CalculateTF(tokens)

		assert.Equal(t, 0.5, tf["hello"])  // 2/4
		assert.Equal(t, 0.25, tf["world"]) // 1/4
		assert.Equal(t, 0.25, tf["test"])  // 1/4
	})

	t.Run("Single token", func(t *testing.T) {
		tokens := []string{"hello"}
		tf := CalculateTF(tokens)

		assert.Equal(t, 1.0, tf["hello"])
	})
}

func TestCosineSimilarity(t *testing.T) {
	t.Run("Identical vectors", func(t *testing.T) {
		vec1 := map[string]float64{
			"hello": 0.5,
			"world": 0.5,
		}
		vec2 := map[string]float64{
			"hello": 0.5,
			"world": 0.5,
		}

		similarity := CosineSimilarity(vec1, vec2)
		assert.InDelta(t, 1.0, similarity, 0.001)
	})

	t.Run("Orthogonal vectors", func(t *testing.T) {
		vec1 := map[string]float64{
			"hello": 1.0,
		}
		vec2 := map[string]float64{
			"world": 1.0,
		}

		similarity := CosineSimilarity(vec1, vec2)
		assert.Equal(t, 0.0, similarity)
	})

	t.Run("Partial overlap", func(t *testing.T) {
		vec1 := map[string]float64{
			"hello": 1.0,
			"world": 1.0,
		}
		vec2 := map[string]float64{
			"hello": 1.0,
			"test":  1.0,
		}

		similarity := CosineSimilarity(vec1, vec2)
		assert.Greater(t, similarity, 0.0)
		assert.Less(t, similarity, 1.0)
	})
}

func TestFindSimilarProducts(t *testing.T) {
	t.Run("Find similar products", func(t *testing.T) {
		products := []models.Product{
			{
				ID:    "1",
				Title: "Wireless Mouse",
				Tags:  []string{"mouse", "wireless", "computer"},
			},
			{
				ID:    "2",
				Title: "Wireless Keyboard",
				Tags:  []string{"keyboard", "wireless", "computer"},
			},
			{
				ID:    "3",
				Title: "USB Cable",
				Tags:  []string{"cable", "usb", "accessory"},
			},
		}

		similarities := FindSimilarProducts("1", products, 2)

		assert.Len(t, similarities, 2)
		// Product 2 (keyboard) should be more similar than product 3 (cable)
		// because both share "wireless" and "computer" tags
		assert.Equal(t, "2", similarities[0].ProductID)
		assert.Greater(t, similarities[0].Similarity, similarities[1].Similarity)
	})

	t.Run("Handle nonexistent product", func(t *testing.T) {
		products := []models.Product{
			{
				ID:    "1",
				Title: "Mouse",
				Tags:  []string{"mouse"},
			},
		}

		similarities := FindSimilarProducts("nonexistent", products, 5)
		assert.Empty(t, similarities)
	})
}

func TestCalculateQuerySimilarity(t *testing.T) {
	t.Run("Exact match", func(t *testing.T) {
		query := "wireless mouse"
		product := models.Product{
			Title: "Wireless Mouse",
			Tags:  []string{"wireless", "mouse"},
		}

		similarity := CalculateQuerySimilarity(query, product)
		assert.Equal(t, 1.0, similarity) // Both tokens match
	})

	t.Run("Partial match", func(t *testing.T) {
		query := "wireless keyboard gaming"
		product := models.Product{
			Title: "Wireless Keyboard",
			Tags:  []string{"wireless", "keyboard"},
		}

		similarity := CalculateQuerySimilarity(query, product)
		assert.InDelta(t, 0.666, similarity, 0.01) // 2 out of 3 tokens match
	})

	t.Run("No match", func(t *testing.T) {
		query := "mouse"
		product := models.Product{
			Title: "Monitor",
			Tags:  []string{"display", "screen"},
		}

		similarity := CalculateQuerySimilarity(query, product)
		assert.Equal(t, 0.0, similarity)
	})
}

func TestVectorMagnitude(t *testing.T) {
	t.Run("Calculate magnitude", func(t *testing.T) {
		vec := map[string]float64{
			"a": 3.0,
			"b": 4.0,
		}

		magnitude := VectorMagnitude(vec)
		assert.Equal(t, 5.0, magnitude) // sqrt(3^2 + 4^2) = 5
	})

	t.Run("Empty vector", func(t *testing.T) {
		vec := map[string]float64{}

		magnitude := VectorMagnitude(vec)
		assert.Equal(t, 0.0, magnitude)
	})
}
