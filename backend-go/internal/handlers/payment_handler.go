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

// CreatePaymentIntent handles creating a Stripe payment intent
// POST /api/payment/create-payment-intent
func (h *PaymentHandler) CreatePaymentIntent(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	var req services.CreatePaymentIntentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, err, "Invalid request body")
		return
	}

	// Call service
	paymentIntent, err := h.paymentService.CreatePaymentIntent(userID.(string), req)
	if err != nil {
		if err.Error() == "stripe is not configured" {
			utils.RespondInternalError(c, err, "Payment service not configured")
			return
		}
		utils.RespondInternalError(c, err, "Failed to create payment intent")
		return
	}

	// Return success
	utils.RespondSuccess(c, paymentIntent)
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

	utils.RespondSuccess(c, gin.H{
		"publishableKey": key,
	})
}
