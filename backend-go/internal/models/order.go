package models

import (
	"time"
)

// OrderStatus represents the status of an order
type OrderStatus string

const (
	OrderStatusPending    OrderStatus = "PENDING"
	OrderStatusPaid       OrderStatus = "PAID"
	OrderStatusProcessing OrderStatus = "PROCESSING"
	OrderStatusShipped    OrderStatus = "SHIPPED"
	OrderStatusDelivered  OrderStatus = "DELIVERED"
	OrderStatusCancelled  OrderStatus = "CANCELLED"
)

// Order represents a customer order
type Order struct {
	ID        string      `gorm:"primaryKey;type:varchar(30);column:id" json:"id"`
	UserID    string      `gorm:"not null;index;column:userId" json:"userId"`
	Total     int         `gorm:"not null;column:total" json:"total"` // Total amount in cents
	Status    OrderStatus `gorm:"type:varchar(20);default:'PENDING';index;column:status" json:"status"`
	CreatedAt time.Time   `gorm:"autoCreateTime;index;column:createdAt" json:"createdAt"`
	UpdatedAt time.Time   `gorm:"autoUpdateTime;column:updatedAt" json:"updatedAt"`

	// Relations
	User  User        `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Items []OrderItem `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
}

// TableName specifies the table name for GORM
func (Order) TableName() string {
	return "orders"
}

// OrderItem represents an item in an order (snapshot at time of purchase)
type OrderItem struct {
	ID        string    `gorm:"primaryKey;type:varchar(30);column:id" json:"id"`
	OrderID   string    `gorm:"not null;index;column:orderId" json:"orderId"`
	ProductID string    `gorm:"not null;column:productId" json:"productId"`
	Quantity  int       `gorm:"not null;column:quantity" json:"quantity"`
	Price     int       `gorm:"not null;column:price" json:"price"` // Price at time of purchase (cents)
	CreatedAt time.Time `gorm:"autoCreateTime;column:createdAt" json:"createdAt"`

	// Relations
	Order   Order   `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE" json:"-"`
	Product Product `gorm:"foreignKey:ProductID;constraint:OnDelete:RESTRICT" json:"product,omitempty"`
}

// TableName specifies the table name for GORM
func (OrderItem) TableName() string {
	return "order_items"
}

// OrderWithDetails includes full order details with items
type OrderWithDetails struct {
	ID        string      `json:"id"`
	UserID    string      `json:"userId"`
	Total     int         `json:"total"`
	Status    OrderStatus `json:"status"`
	CreatedAt time.Time   `json:"createdAt"`
	UpdatedAt time.Time   `json:"updatedAt"`
	Items     []OrderItem `json:"items"`
}
