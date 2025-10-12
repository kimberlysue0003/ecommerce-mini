package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/services"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
)

// ProductHandler handles product HTTP requests
type ProductHandler struct {
	productService *services.ProductService
}

// NewProductHandler creates a new product handler instance
func NewProductHandler(productService *services.ProductService) *ProductHandler {
	return &ProductHandler{
		productService: productService,
	}
}

// List handles product listing with filters
// GET /api/products
func (h *ProductHandler) List(c *gin.Context) {
	var req services.ProductListRequest

	// Bind query parameters
	if err := c.ShouldBindQuery(&req); err != nil {
		utils.RespondBadRequest(c, err, "Invalid query parameters")
		return
	}

	// Call service
	response, err := h.productService.GetAll(req)
	if err != nil {
		utils.RespondInternalError(c, err, "Failed to fetch products")
		return
	}

	// Return paginated response
	utils.RespondPaginated(c, response.Products, response.Pagination)
}

// GetByID handles getting a product by ID
// GET /api/products/:id
func (h *ProductHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	// Call service
	product, err := h.productService.GetByID(id)
	if err != nil {
		if err.Error() == "product not found" {
			utils.RespondNotFound(c, err, "Product not found")
			return
		}
		utils.RespondInternalError(c, err, "Failed to fetch product")
		return
	}

	// Return success
	utils.RespondSuccess(c, product)
}

// GetBySlug handles getting a product by slug
// GET /api/products/slug/:slug
func (h *ProductHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")

	// Call service
	product, err := h.productService.GetBySlug(slug)
	if err != nil {
		if err.Error() == "product not found" {
			utils.RespondNotFound(c, err, "Product not found")
			return
		}
		utils.RespondInternalError(c, err, "Failed to fetch product")
		return
	}

	// Return success
	utils.RespondSuccess(c, product)
}
