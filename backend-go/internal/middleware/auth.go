package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
)

// AuthMiddleware verifies JWT token and sets user info in context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Authorization header is required",
			})
			c.Abort()
			return
		}

		// Extract token
		tokenString, err := utils.ExtractToken(authHeader)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   err.Error(),
			})
			c.Abort()
			return
		}

		// Verify token
		claims, err := utils.VerifyJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)

		// Continue to next handler
		c.Next()
	}
}

// OptionalAuthMiddleware sets user info if token is present but doesn't require it
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// No token, continue without setting user info
			c.Next()
			return
		}

		// Extract token
		tokenString, err := utils.ExtractToken(authHeader)
		if err != nil {
			// Invalid format, continue without setting user info
			c.Next()
			return
		}

		// Verify token
		claims, err := utils.VerifyJWT(tokenString)
		if err != nil {
			// Invalid token, continue without setting user info
			c.Next()
			return
		}

		// Set user info in context
		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)

		// Continue to next handler
		c.Next()
	}
}
