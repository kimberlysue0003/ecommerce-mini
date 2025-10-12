package models

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID        string    `gorm:"primaryKey;type:varchar(30)" json:"id"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email" binding:"required,email"`
	Password  string    `gorm:"not null" json:"-"` // Never expose password in JSON
	Name      *string   `json:"name"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

	// Relations (omit in JSON by default to avoid circular references)
	CartItems     []CartItem     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"cartItems,omitempty"`
	Orders        []Order        `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"orders,omitempty"`
	UserBehaviors []UserBehavior `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// TableName specifies the table name for GORM (matches Prisma schema)
func (User) TableName() string {
	return "users"
}

// UserResponse is used for API responses (excludes password and relations)
type UserResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      *string   `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// ToResponse converts User to UserResponse
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Email:     u.Email,
		Name:      u.Name,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}
