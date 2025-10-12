package models

import (
	"time"
)

// ActionType represents user behavior action types
type ActionType string

const (
	ActionTypeView        ActionType = "VIEW"
	ActionTypeAddToCart   ActionType = "ADD_TO_CART"
	ActionTypePurchase    ActionType = "PURCHASE"
)

// UserBehavior tracks user interactions for AI recommendations
type UserBehavior struct {
	ID        string     `gorm:"primaryKey;type:varchar(30)" json:"id"`
	UserID    string     `gorm:"not null;index:idx_user_action" json:"userId"`
	ProductID string     `gorm:"not null;index:idx_product_action" json:"productId"`
	Action    ActionType `gorm:"type:varchar(20);not null;index:idx_user_action,idx_product_action" json:"action"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"createdAt"`

	// Relations
	User    User    `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Product Product `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName specifies the table name for GORM
func (UserBehavior) TableName() string {
	return "user_behaviors"
}
