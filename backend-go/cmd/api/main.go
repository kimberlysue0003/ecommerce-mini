package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/config"
	"github.com/kimberlysue0003/ecommerce-mini/backend-go/internal/utils"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to database
	_, err := config.ConnectDatabase(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer config.CloseDatabase()

	// Set Gin mode
	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	router := gin.Default()

	// Setup middleware
	setupMiddleware(router, cfg)

	// Setup routes
	setupRoutes(router)

	// Start server
	startServer(router, cfg)
}

func setupMiddleware(router *gin.Engine, cfg *config.Config) {
	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", cfg.CORSOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Security headers middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
		c.Writer.Header().Set("X-Frame-Options", "DENY")
		c.Writer.Header().Set("X-XSS-Protection", "1; mode=block")
		c.Next()
	})

	// Request logger middleware
	router.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("[%s] %s %s %d %s\n",
			param.TimeStamp.Format("15:04:05"),
			param.Method,
			param.Path,
			param.StatusCode,
			param.Latency,
		)
	}))

	// Recovery middleware
	router.Use(gin.Recovery())
}

func setupRoutes(router *gin.Engine) {
	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
			"uptime":    time.Since(startTime).Seconds(),
			"service":   "ecommerce-backend-go",
		})
	})

	// API routes group
	api := router.Group("/api")
	{
		// TODO: Add auth routes
		// api.POST("/auth/register", authHandler.Register)
		// api.POST("/auth/login", authHandler.Login)
		// api.GET("/auth/me", authMiddleware, authHandler.Me)

		// TODO: Add product routes
		// api.GET("/products", productHandler.List)
		// api.GET("/products/:id", productHandler.GetByID)

		// Placeholder endpoint
		api.GET("/status", func(c *gin.Context) {
			utils.RespondSuccess(c, gin.H{
				"message": "Go backend API is running",
				"version": "1.0.0",
			})
		})
	}

	// 404 handler
	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Route not found",
			"path":    c.Request.URL.Path,
		})
	})
}

var startTime = time.Now()

func startServer(router *gin.Engine, cfg *config.Config) {
	// Create server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		utils.Log.Success("🚀 Server running on port %s", cfg.Port)
		utils.Log.Info("📍 REST API: http://localhost:%s/api", cfg.Port)
		utils.Log.Info("💚 Health: http://localhost:%s/health", cfg.Port)
		utils.Log.Info("🌍 Environment: %s", cfg.Environment)

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	utils.Log.Info("🛑 Shutting down server...")

	// Graceful shutdown with timeout
	// ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	// defer cancel()

	utils.Log.Success("✅ Server exited successfully")
}
