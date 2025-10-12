package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/services"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
)

// CartHandler handles cart HTTP requests
type CartHandler struct {
	cartService *services.CartService
}

// NewCartHandler creates a new cart handler instance
func NewCartHandler(cartService *services.CartService) *CartHandler {
	return &CartHandler{
		cartService: cartService,
	}
}

// GetCart handles getting user's cart
// GET /api/cart
func (h *CartHandler) GetCart(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	// Call service
	cart, err := h.cartService.GetCart(userID.(string))
	if err != nil {
		utils.RespondInternalError(c, err, "Failed to fetch cart")
		return
	}

	// Return success
	utils.RespondSuccess(c, cart)
}

// AddItem handles adding item to cart
// POST /api/cart
func (h *CartHandler) AddItem(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	var req services.AddItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, err, "Invalid request body")
		return
	}

	// Call service
	cartItem, err := h.cartService.AddItem(userID.(string), req)
	if err != nil {
		if err.Error() == "product not found" {
			utils.RespondNotFound(c, err, "Product not found")
			return
		}
		if err.Error() == "insufficient stock" {
			utils.RespondBadRequest(c, err, "Insufficient stock")
			return
		}
		utils.RespondInternalError(c, err, "Failed to add item to cart")
		return
	}

	// Return success
	utils.RespondCreated(c, cartItem, "Item added to cart")
}

// UpdateItem handles updating cart item quantity
// PUT /api/cart/:itemId
func (h *CartHandler) UpdateItem(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	itemID := c.Param("itemId")

	var req services.UpdateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, err, "Invalid request body")
		return
	}

	// Call service
	cartItem, err := h.cartService.UpdateItem(userID.(string), itemID, req)
	if err != nil {
		if err.Error() == "cart item not found" {
			utils.RespondNotFound(c, err, "Cart item not found")
			return
		}
		if err.Error() == "insufficient stock" {
			utils.RespondBadRequest(c, err, "Insufficient stock")
			return
		}
		utils.RespondInternalError(c, err, "Failed to update cart item")
		return
	}

	// Return success
	utils.RespondSuccess(c, cartItem, "Cart item updated")
}

// RemoveItem handles removing item from cart
// DELETE /api/cart/:itemId
func (h *CartHandler) RemoveItem(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	itemID := c.Param("itemId")

	// Call service
	if err := h.cartService.RemoveItem(userID.(string), itemID); err != nil {
		if err.Error() == "cart item not found" {
			utils.RespondNotFound(c, err, "Cart item not found")
			return
		}
		utils.RespondInternalError(c, err, "Failed to remove cart item")
		return
	}

	// Return success
	utils.RespondSuccess(c, gin.H{}, "Item removed from cart")
}
