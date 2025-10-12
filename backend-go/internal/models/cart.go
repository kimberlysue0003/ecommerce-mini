package models

import (
	"time"
)

// CartItem represents an item in a user's shopping cart
type CartItem struct {
	ID        string    `gorm:"primaryKey;type:varchar(30);column:id" json:"id"`
	UserID    string    `gorm:"not null;index;column:userId" json:"userId"`
	ProductID string    `gorm:"not null;index;column:productId" json:"productId"`
	Quantity  int       `gorm:"default:1;column:quantity" json:"quantity" binding:"required,min=1"`
	CreatedAt time.Time `gorm:"autoCreateTime;column:createdAt" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime;column:updatedAt" json:"updatedAt"`

	// Relations
	User    User    `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Product Product `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE" json:"product,omitempty"`
}

// TableName specifies the table name for GORM
func (CartItem) TableName() string {
	return "cart_items"
}

// CartItemWithProduct includes full product details
type CartItemWithProduct struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	ProductID string    `json:"productId"`
	Quantity  int       `json:"quantity"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Product   Product   `json:"product"`
}

// CartResponse represents the user's complete cart
type CartResponse struct {
	Items []CartItemWithProduct `json:"items"`
	Total int                   `json:"total"` // Total price in cents
}
