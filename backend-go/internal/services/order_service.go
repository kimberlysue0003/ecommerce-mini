package services

import (
	"errors"

	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/config"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/models"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
	"gorm.io/gorm"
)

// OrderService handles order business logic
type OrderService struct {
	db *gorm.DB
}

// NewOrderService creates a new order service instance
func NewOrderService(db *gorm.DB) *OrderService {
	return &OrderService{db: db}
}

// CreateOrderRequest represents create order request
type CreateOrderRequest struct {
	Items []OrderItemInput `json:"items" binding:"required,min=1"`
}

// OrderItemInput represents an item to add to order
type OrderItemInput struct {
	ProductID string `json:"productId" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
}

// CreateOrder creates a new order from cart or direct items
func (s *OrderService) CreateOrder(userID string, req CreateOrderRequest) (*models.Order, error) {
	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Validate and calculate total
	var orderItems []models.OrderItem
	total := 0

	for _, item := range req.Items {
		// Get product
		var product models.Product
		if err := tx.Where("id = ?", item.ProductID).First(&product).Error; err != nil {
			tx.Rollback()
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("product not found: " + item.ProductID)
			}
			return nil, err
		}

		// Check stock
		if product.Stock < item.Quantity {
			tx.Rollback()
			return nil, errors.New("insufficient stock for: " + product.Title)
		}

		// Create order item
		orderItem := models.OrderItem{
			ID:        utils.GenerateID(),
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     product.Price, // Snapshot current price
		}
		orderItems = append(orderItems, orderItem)
		total += product.Price * item.Quantity

		// Update stock
		product.Stock -= item.Quantity
		if err := tx.Save(&product).Error; err != nil {
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

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Load items with products
	order.Items = orderItems
	return &order, nil
}

// CreateOrderFromCart creates an order from user's cart
func (s *OrderService) CreateOrderFromCart(userID string) (*models.Order, error) {
	// Get cart items
	var cartItems []models.CartItem
	err := s.db.Where(`"userId" = ?`, userID).
		Preload("Product").
		Find(&cartItems).Error
	if err != nil {
		return nil, err
	}

	if len(cartItems) == 0 {
		return nil, errors.New("cart is empty")
	}

	// Convert cart items to order items
	var orderItemInputs []OrderItemInput
	for _, cartItem := range cartItems {
		orderItemInputs = append(orderItemInputs, OrderItemInput{
			ProductID: cartItem.ProductID,
			Quantity:  cartItem.Quantity,
		})
	}

	// Create order
	order, err := s.CreateOrder(userID, CreateOrderRequest{Items: orderItemInputs})
	if err != nil {
		return nil, err
	}

	// Clear cart after successful order
	s.db.Where(`"userId" = ?`, userID).Delete(&models.CartItem{})

	return order, nil
}

// GetUserOrders retrieves all orders for a user
func (s *OrderService) GetUserOrders(userID string) ([]models.Order, error) {
	var orders []models.Order
	err := s.db.Where(`"userId" = ?`, userID).
		Preload("Items.Product").
		Order(`"createdAt" DESC`).
		Find(&orders).Error
	if err != nil {
		return nil, err
	}
	return orders, nil
}

// GetOrderByID retrieves an order by ID (with ownership check)
func (s *OrderService) GetOrderByID(userID, orderID string) (*models.Order, error) {
	var order models.Order
	err := s.db.Where(`id = ? AND "userId" = ?`, orderID, userID).
		Preload("Items.Product").
		First(&order).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("order not found")
		}
		return nil, err
	}
	return &order, nil
}

// UpdateOrderStatus updates the status of an order
func (s *OrderService) UpdateOrderStatus(userID, orderID string, status models.OrderStatus) (*models.Order, error) {
	var order models.Order
	err := s.db.Where(`id = ? AND "userId" = ?`, orderID, userID).First(&order).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("order not found")
		}
		return nil, err
	}

	order.Status = status
	if err := s.db.Save(&order).Error; err != nil {
		return nil, err
	}

	return &order, nil
}

// GetOrderService returns a global order service instance
func GetOrderService() *OrderService {
	return NewOrderService(config.DB)
}
