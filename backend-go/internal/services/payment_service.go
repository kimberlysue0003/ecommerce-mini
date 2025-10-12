package services

import (
	"errors"
	"fmt"

	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/config"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/models"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/paymentintent"
	"gorm.io/gorm"
)

// PaymentService handles payment processing with Stripe
type PaymentService struct {
	db *gorm.DB
}

// NewPaymentService creates a new payment service instance
func NewPaymentService(db *gorm.DB) *PaymentService {
	// Initialize Stripe
	if config.AppConfig.StripeSecretKey != "" {
		stripe.Key = config.AppConfig.StripeSecretKey
	}
	return &PaymentService{db: db}
}

// CreatePaymentIntentRequest represents payment intent creation request
type CreatePaymentIntentRequest struct {
	Amount   int64             `json:"amount" binding:"required,min=1"` // Amount in cents
	Currency string            `json:"currency"`
	Metadata map[string]string `json:"metadata"`
}

// CreatePaymentIntentResponse represents payment intent response
type CreatePaymentIntentResponse struct {
	ClientSecret    string `json:"clientSecret"`
	PaymentIntentID string `json:"paymentIntentId"`
}

// OrderWithPaymentResponse represents order creation with payment
type OrderWithPaymentResponse struct {
	Order   *models.Order               `json:"order"`
	Payment CreatePaymentIntentResponse `json:"payment"`
}

// CreatePaymentIntent creates a Stripe payment intent
func (s *PaymentService) CreatePaymentIntent(userID string, req CreatePaymentIntentRequest) (*CreatePaymentIntentResponse, error) {
	if stripe.Key == "" {
		return nil, errors.New("stripe is not configured")
	}

	// Set default currency
	currency := req.Currency
	if currency == "" {
		currency = "usd"
	}

	// Prepare metadata
	metadata := req.Metadata
	if metadata == nil {
		metadata = make(map[string]string)
	}
	metadata["userId"] = userID

	// Create payment intent params
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(req.Amount),
		Currency: stripe.String(currency),
		Metadata: metadata,
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}

	// Create payment intent
	pi, err := paymentintent.New(params)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment intent: %w", err)
	}

	return &CreatePaymentIntentResponse{
		ClientSecret:    pi.ClientSecret,
		PaymentIntentID: pi.ID,
	}, nil
}

// CreateOrderWithPayment creates an order from cart and initiates payment
func (s *PaymentService) CreateOrderWithPayment(userID string) (*OrderWithPaymentResponse, error) {
	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Get user's cart items
	var cartItems []models.CartItem
	err := tx.Where(`"userId" = ?`, userID).
		Preload("Product").
		Find(&cartItems).Error
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if len(cartItems) == 0 {
		tx.Rollback()
		return nil, errors.New("cart is empty")
	}

	// Calculate total and prepare order items
	total := 0
	var orderItems []models.OrderItem

	for _, item := range cartItems {
		// Check stock
		if item.Product.Stock < item.Quantity {
			tx.Rollback()
			return nil, fmt.Errorf("insufficient stock for: %s", item.Product.Title)
		}

		// Create order item
		orderItem := models.OrderItem{
			ID:        utils.GenerateID(),
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Product.Price,
		}
		orderItems = append(orderItems, orderItem)
		total += item.Product.Price * item.Quantity

		// Update stock
		item.Product.Stock -= item.Quantity
		if err := tx.Save(&item.Product).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// Create order
	order := models.Order{
		ID:     utils.GenerateID(),
		UserID: userID,
		Total:  total,
		Status: models.OrderStatusPending,
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Set order ID for items and create them
	for i := range orderItems {
		orderItems[i].OrderID = order.ID
	}

	if err := tx.Create(&orderItems).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Commit transaction before creating payment intent
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Create payment intent (outside transaction)
	paymentIntent, err := s.CreatePaymentIntent(userID, CreatePaymentIntentRequest{
		Amount:   int64(total),
		Currency: "usd",
		Metadata: map[string]string{
			"orderId": order.ID,
		},
	})
	if err != nil {
		return nil, err
	}

	// Clear cart after successful order creation
	s.db.Where(`"userId" = ?`, userID).Delete(&models.CartItem{})

	// Load order with items
	order.Items = orderItems

	return &OrderWithPaymentResponse{
		Order:   &order,
		Payment: *paymentIntent,
	}, nil
}

// ConfirmPayment confirms payment and updates order status
func (s *PaymentService) ConfirmPayment(paymentIntentID string) (*models.Order, error) {
	if stripe.Key == "" {
		return nil, errors.New("stripe is not configured")
	}

	// Retrieve payment intent
	pi, err := paymentintent.Get(paymentIntentID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve payment intent: %w", err)
	}

	if pi.Status != stripe.PaymentIntentStatusSucceeded {
		return nil, errors.New("payment has not succeeded")
	}

	// Get order ID from metadata
	orderId, ok := pi.Metadata["orderId"]
	if !ok || orderId == "" {
		return nil, errors.New("order ID not found in payment metadata")
	}

	// Update order status
	var order models.Order
	err = s.db.Where("id = ?", orderId).First(&order).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("order not found")
		}
		return nil, err
	}

	order.Status = models.OrderStatusPaid
	if err := s.db.Save(&order).Error; err != nil {
		return nil, err
	}

	// Load order with items and products
	s.db.Where("id = ?", order.ID).
		Preload("Items.Product").
		First(&order)

	return &order, nil
}

// GetPublishableKey returns Stripe publishable key for frontend
func (s *PaymentService) GetPublishableKey() (string, error) {
	if config.AppConfig.StripePublishableKey == "" {
		return "", errors.New("stripe publishable key is not configured")
	}
	return config.AppConfig.StripePublishableKey, nil
}

// GetPaymentService returns a global payment service instance
func GetPaymentService() *PaymentService {
	return NewPaymentService(config.DB)
}
