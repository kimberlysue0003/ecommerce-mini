package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/services"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
)

// OrderHandler handles order HTTP requests
type OrderHandler struct {
	orderService *services.OrderService
}

// NewOrderHandler creates a new order handler instance
func NewOrderHandler(orderService *services.OrderService) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
	}
}

// CreateOrder handles creating a new order
// POST /api/orders
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	var req services.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, err, "Invalid request body")
		return
	}

	// Call service
	order, err := h.orderService.CreateOrder(userID.(string), req)
	if err != nil {
		if err.Error() == "cart is empty" {
			utils.RespondBadRequest(c, err, "Cart is empty")
			return
		}
		utils.RespondInternalError(c, err, "Failed to create order")
		return
	}

	// Return success
	utils.RespondCreated(c, order, "Order created successfully")
}

// CreateOrderFromCart handles creating order from cart
// POST /api/orders/from-cart
func (h *OrderHandler) CreateOrderFromCart(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	// Call service
	order, err := h.orderService.CreateOrderFromCart(userID.(string))
	if err != nil {
		if err.Error() == "cart is empty" {
			utils.RespondBadRequest(c, err, "Cart is empty")
			return
		}
		utils.RespondInternalError(c, err, "Failed to create order from cart")
		return
	}

	// Return success
	utils.RespondCreated(c, order, "Order created from cart successfully")
}

// GetUserOrders handles getting all user orders
// GET /api/orders
func (h *OrderHandler) GetUserOrders(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	// Call service
	orders, err := h.orderService.GetUserOrders(userID.(string))
	if err != nil {
		utils.RespondInternalError(c, err, "Failed to fetch orders")
		return
	}

	// Return success
	utils.RespondSuccess(c, orders)
}

// GetOrderByID handles getting a specific order
// GET /api/orders/:id
func (h *OrderHandler) GetOrderByID(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	orderID := c.Param("id")

	// Call service
	order, err := h.orderService.GetOrderByID(userID.(string), orderID)
	if err != nil {
		if err.Error() == "order not found" {
			utils.RespondNotFound(c, err, "Order not found")
			return
		}
		utils.RespondInternalError(c, err, "Failed to fetch order")
		return
	}

	// Return success
	utils.RespondSuccess(c, order)
}
