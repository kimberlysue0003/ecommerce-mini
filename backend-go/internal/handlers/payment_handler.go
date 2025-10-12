package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/services"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
)

// PaymentHandler handles payment HTTP requests
type PaymentHandler struct {
	paymentService *services.PaymentService
}

// NewPaymentHandler creates a new payment handler instance
func NewPaymentHandler(paymentService *services.PaymentService) *PaymentHandler {
	return &PaymentHandler{
		paymentService: paymentService,
	}
}

// CreatePaymentIntent handles creating payment intent from cart
// POST /api/payment/create-payment-intent
// Compatible with Node.js backend - syncs items to cart, then creates order with payment
func (h *PaymentHandler) CreatePaymentIntent(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	// Parse request body (items are optional)
	var req struct {
		Items []struct {
			ProductID string `json:"productId"`
			Quantity  int    `json:"quantity"`
		} `json:"items"`
	}
	// Ignore binding errors since items is optional
	c.ShouldBindJSON(&req)

	// If items provided, sync to backend cart first (Node.js behavior)
	if len(req.Items) > 0 {
		err := h.paymentService.SyncCartItems(userID.(string), req.Items)
		if err != nil {
			utils.RespondInternalError(c, err, "Failed to sync cart items")
			return
		}
	}

	// Create order from cart with payment (same as Node.js backend)
	result, err := h.paymentService.CreateOrderWithPayment(userID.(string))
	if err != nil {
		if err.Error() == "stripe is not configured" {
			utils.RespondInternalError(c, err, "Payment service not configured")
			return
		}
		if err.Error() == "cart is empty" {
			utils.RespondBadRequest(c, err, "Cart is empty")
			return
		}
		utils.RespondInternalError(c, err, "Failed to create payment intent")
		return
	}

	// Return response compatible with Node.js backend format
	c.JSON(200, gin.H{
		"orderId":         result.Order.ID,
		"clientSecret":    result.Payment.ClientSecret,
		"paymentIntentId": result.Payment.PaymentIntentID,
		"total":           result.Order.Total,
	})
}

// CreateOrderWithPayment handles creating order from cart with payment
// POST /api/payment/create-order-with-payment
func (h *PaymentHandler) CreateOrderWithPayment(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	// Call service
	result, err := h.paymentService.CreateOrderWithPayment(userID.(string))
	if err != nil {
		if err.Error() == "cart is empty" {
			utils.RespondBadRequest(c, err, "Cart is empty")
			return
		}
		if err.Error() == "stripe is not configured" {
			utils.RespondInternalError(c, err, "Payment service not configured")
			return
		}
		utils.RespondInternalError(c, err, "Failed to create order with payment")
		return
	}

	// Return success
	utils.RespondCreated(c, result, "Order created with payment intent")
}

// ConfirmPayment handles payment confirmation
// POST /api/payment/confirm
func (h *PaymentHandler) ConfirmPayment(c *gin.Context) {
	// Get user ID from context (for authorization)
	_, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	var req struct {
		PaymentIntentID string `json:"paymentIntentId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, err, "Invalid request body")
		return
	}

	// Call service
	order, err := h.paymentService.ConfirmPayment(req.PaymentIntentID)
	if err != nil {
		if err.Error() == "payment has not succeeded" {
			utils.RespondBadRequest(c, err, "Payment has not succeeded")
			return
		}
		if err.Error() == "order not found" {
			utils.RespondNotFound(c, err, "Order not found")
			return
		}
		utils.RespondInternalError(c, err, "Failed to confirm payment")
		return
	}

	// Return success
	utils.RespondSuccess(c, order, "Payment confirmed successfully")
}

// GetPublishableKey handles getting Stripe publishable key
// GET /api/payment/config
func (h *PaymentHandler) GetPublishableKey(c *gin.Context) {
	key, err := h.paymentService.GetPublishableKey()
	if err != nil {
		utils.RespondInternalError(c, err, "Failed to get publishable key")
		return
	}

	// Return response compatible with Node.js backend format (no wrapper)
	c.JSON(200, gin.H{
		"publishableKey": key,
	})
}
