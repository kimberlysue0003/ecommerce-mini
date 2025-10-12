package models

import (
	"time"

	"github.com/lib/pq"
)

// Product represents a product in the e-commerce system
type Product struct {
	ID          string         `gorm:"primaryKey;type:varchar(30);column:id" json:"id"`
	Slug        string         `gorm:"uniqueIndex;not null;column:slug" json:"slug"`
	Title       string         `gorm:"not null;column:title" json:"title" binding:"required"`
	Description *string        `gorm:"column:description" json:"description"`
	Price       int            `gorm:"not null;column:price" json:"price" binding:"required,min=0"` // Price in cents
	Tags        pq.StringArray `gorm:"type:text[];column:tags" json:"tags"`
	Stock       int            `gorm:"default:0;column:stock" json:"stock"`
	Rating      float64        `gorm:"default:0;column:rating" json:"rating"`
	ImageURL    *string        `gorm:"column:imageUrl" json:"imageUrl"`
	CreatedAt   time.Time      `gorm:"autoCreateTime;column:createdAt" json:"createdAt"`
	UpdatedAt   time.Time      `gorm:"autoUpdateTime;column:updatedAt" json:"updatedAt"`

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
