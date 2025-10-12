package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/services"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
)

// AuthHandler handles authentication HTTP requests
type AuthHandler struct {
	authService *services.AuthService
}

// NewAuthHandler creates a new auth handler instance
func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register handles user registration
// POST /api/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req services.RegisterRequest

	// Bind and validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, err, "Invalid request body")
		return
	}

	// Call service
	response, err := h.authService.Register(req)
	if err != nil {
		if err.Error() == "user with this email already exists" {
			utils.RespondError(c, http.StatusConflict, err, "Email already registered")
			return
		}
		utils.RespondInternalError(c, err, "Failed to register user")
		return
	}

	// Return success
	utils.RespondCreated(c, response, "User registered successfully")
}

// Login handles user login
// POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req services.LoginRequest

	// Bind and validate request
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.RespondBadRequest(c, err, "Invalid request body")
		return
	}

	// Call service
	response, err := h.authService.Login(req)
	if err != nil {
		if err.Error() == "invalid email or password" {
			utils.RespondUnauthorized(c, err, "Invalid credentials")
			return
		}
		utils.RespondInternalError(c, err, "Failed to login")
		return
	}

	// Return success
	utils.RespondSuccess(c, response, "Login successful")
}

// GetMe handles getting current user info
// GET /api/auth/me
func (h *AuthHandler) GetMe(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		utils.RespondUnauthorized(c, nil, "User not authenticated")
		return
	}

	// Call service
	user, err := h.authService.GetCurrentUser(userID.(string))
	if err != nil {
		if err.Error() == "user not found" {
			utils.RespondNotFound(c, err, "User not found")
			return
		}
		utils.RespondInternalError(c, err, "Failed to get user")
		return
	}

	// Return success
	utils.RespondSuccess(c, user)
}
