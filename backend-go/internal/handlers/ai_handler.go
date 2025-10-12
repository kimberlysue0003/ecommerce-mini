package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/services"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
)

// AIHandler handles AI HTTP requests
type AIHandler struct {
	aiService *services.AIService
}

// NewAIHandler creates a new AI handler instance
func NewAIHandler(aiService *services.AIService) *AIHandler {
	return &AIHandler{
		aiService: aiService,
	}
}

// Search handles AI-powered search
// POST /api/ai/search
func (h *AIHandler) Search(c *gin.Context) {
	var req struct {
		Query string `json:"query" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, err, "Invalid request body")
		return
	}

	limit := 20
	if limitParam := c.Query("limit"); limitParam != "" {
		limit = utils.ParseInt(limitParam)
		if limit <= 0 || limit > 100 {
			limit = 20
		}
	}

	result, err := h.aiService.SearchProducts(req.Query, limit)
	if err != nil {
		utils.RespondInternalError(c, err, "Search failed")
		return
	}

	utils.RespondSuccess(c, result)
}

// GetSimilarProducts returns similar products
// GET /api/ai/recommend/:productId
func (h *AIHandler) GetSimilarProducts(c *gin.Context) {
	productID := c.Param("productId")

	limit := 5
	if limitParam := c.Query("limit"); limitParam != "" {
		limit = utils.ParseInt(limitParam)
		if limit <= 0 || limit > 20 {
			limit = 5
		}
	}

	products, err := h.aiService.GetSimilarProducts(productID, limit)
	if err != nil {
		utils.RespondInternalError(c, err, "Failed to get similar products")
		return
	}

	utils.RespondSuccess(c, products)
}

// GetPopularProducts returns popular products
// GET /api/ai/popular
func (h *AIHandler) GetPopularProducts(c *gin.Context) {
	limit := 10
	if limitParam := c.Query("limit"); limitParam != "" {
		limit = utils.ParseInt(limitParam)
		if limit <= 0 || limit > 50 {
			limit = 10
		}
	}

	products, err := h.aiService.GetPopularProducts(limit)
	if err != nil {
		utils.RespondInternalError(c, err, "Failed to get popular products")
		return
	}

	utils.RespondSuccess(c, products)
}
