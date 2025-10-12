package services

import (
	"errors"

	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/config"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/models"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
	"gorm.io/gorm"
)

// CartService handles cart business logic
type CartService struct {
	db *gorm.DB
}

// NewCartService creates a new cart service instance
func NewCartService(db *gorm.DB) *CartService {
	return &CartService{db: db}
}

// AddItemRequest represents add to cart request
type AddItemRequest struct {
	ProductID string `json:"productId" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
}

// UpdateItemRequest represents update cart item request
type UpdateItemRequest struct {
	Quantity int `json:"quantity" binding:"required,min=1"`
}

// GetCart retrieves user's cart with products
func (s *CartService) GetCart(userID string) (*models.CartResponse, error) {
	var cartItems []models.CartItem

	// Get cart items with products preloaded
	err := s.db.Where(`"userId" = ?`, userID).
		Preload("Product").
		Find(&cartItems).Error
	if err != nil {
		return nil, err
	}

	// Calculate total
	total := 0
	itemsWithProducts := make([]models.CartItemWithProduct, len(cartItems))
	for i, item := range cartItems {
		itemsWithProducts[i] = models.CartItemWithProduct{
			ID:        item.ID,
			UserID:    item.UserID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			CreatedAt: item.CreatedAt,
			UpdatedAt: item.UpdatedAt,
			Product:   item.Product,
		}
		total += item.Product.Price * item.Quantity
	}

	return &models.CartResponse{
		Items: itemsWithProducts,
		Total: total,
	}, nil
}

// AddItem adds a product to cart or updates quantity if already exists
func (s *CartService) AddItem(userID string, req AddItemRequest) (*models.CartItem, error) {
	// Check if product exists
	var product models.Product
	if err := s.db.Where("id = ?", req.ProductID).First(&product).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("product not found")
		}
		return nil, err
	}

	// Check stock
	if product.Stock < req.Quantity {
		return nil, errors.New("insufficient stock")
	}

	// Check if item already in cart
	var existingItem models.CartItem
	err := s.db.Where(`"userId" = ? AND "productId" = ?`, userID, req.ProductID).
		First(&existingItem).Error

	if err == nil {
		// Update existing item
		existingItem.Quantity += req.Quantity
		if err := s.db.Save(&existingItem).Error; err != nil {
			return nil, err
		}
		return &existingItem, nil
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Create new cart item
	cartItem := models.CartItem{
		ID:        utils.GenerateID(),
		UserID:    userID,
		ProductID: req.ProductID,
		Quantity:  req.Quantity,
	}

	if err := s.db.Create(&cartItem).Error; err != nil {
		return nil, err
	}

	return &cartItem, nil
}

// UpdateItem updates cart item quantity
func (s *CartService) UpdateItem(userID, itemID string, req UpdateItemRequest) (*models.CartItem, error) {
	// Find cart item
	var cartItem models.CartItem
	err := s.db.Where(`id = ? AND "userId" = ?`, itemID, userID).First(&cartItem).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("cart item not found")
		}
		return nil, err
	}

	// Check product stock
	var product models.Product
	if err := s.db.Where("id = ?", cartItem.ProductID).First(&product).Error; err != nil {
		return nil, err
	}

	if product.Stock < req.Quantity {
		return nil, errors.New("insufficient stock")
	}

	// Update quantity
	cartItem.Quantity = req.Quantity
	if err := s.db.Save(&cartItem).Error; err != nil {
		return nil, err
	}

	return &cartItem, nil
}

// RemoveItem removes an item from cart
func (s *CartService) RemoveItem(userID, itemID string) error {
	result := s.db.Where(`id = ? AND "userId" = ?`, itemID, userID).
		Delete(&models.CartItem{})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("cart item not found")
	}

	return nil
}

// ClearCart removes all items from user's cart
func (s *CartService) ClearCart(userID string) error {
	return s.db.Where(`"userId" = ?`, userID).Delete(&models.CartItem{}).Error
}

// GetCartService returns a global cart service instance
func GetCartService() *CartService {
	return NewCartService(config.DB)
}
