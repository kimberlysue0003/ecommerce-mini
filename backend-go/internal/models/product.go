package models

import (
	"time"

	"github.com/lib/pq"
)

// Product represents a product in the e-commerce system
type Product struct {
	ID          string         `gorm:"primaryKey;type:varchar(30)" json:"id"`
	Slug        string         `gorm:"uniqueIndex;not null" json:"slug"`
	Title       string         `gorm:"not null" json:"title" binding:"required"`
	Description *string        `json:"description"`
	Price       int            `gorm:"not null" json:"price" binding:"required,min=0"` // Price in cents
	Tags        pq.StringArray `gorm:"type:text[]" json:"tags"`
	Stock       int            `gorm:"default:0" json:"stock"`
	Rating      float64        `gorm:"default:0" json:"rating"`
	ImageURL    *string        `json:"imageUrl"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`

	// Relations
	CartItems  []CartItem     `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE" json:"-"`
	OrderItems []OrderItem    `gorm:"foreignKey:ProductID;constraint:OnDelete:RESTRICT" json:"-"`
	Behaviors  []UserBehavior `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName specifies the table name for GORM
func (Product) TableName() string {
	return "products"
}

// ProductWithDetails includes additional computed fields
type ProductWithDetails struct {
	Product
	InStock bool `json:"inStock"`
}

// ToProductWithDetails converts Product to ProductWithDetails
func (p *Product) ToProductWithDetails() ProductWithDetails {
	return ProductWithDetails{
		Product: *p,
		InStock: p.Stock > 0,
	}
}
