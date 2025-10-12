package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all application configuration
type Config struct {
	Port                  string
	Environment           string
	DatabaseURL           string
	JWTSecret             string
	StripeSecretKey       string
	StripePublishableKey  string
	CORSOrigin            string
	RateLimitWindowMS     int
	RateLimitMaxRequests  int
}

var AppConfig *Config

// LoadConfig loads environment variables and initializes application config
func LoadConfig() *Config {
	// Load .env file (ignore error in production)
	godotenv.Load()

	config := &Config{
		Port:                  getEnv("PORT", "3001"),
		Environment:           getEnv("GO_ENV", "development"),
		DatabaseURL:           getEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/ecommerce?sslmode=disable"),
		JWTSecret:             getEnv("JWT_SECRET", "default-secret-change-in-production"),
		StripeSecretKey:       getEnv("STRIPE_SECRET_KEY", ""),
		StripePublishableKey:  getEnv("STRIPE_PUBLISHABLE_KEY", ""),
		CORSOrigin:            getEnv("CORS_ORIGIN", "http://localhost:5173"),
		RateLimitWindowMS:     getEnvAsInt("RATE_LIMIT_WINDOW_MS", 900000),
		RateLimitMaxRequests:  getEnvAsInt("RATE_LIMIT_MAX_REQUESTS", 100),
	}

	// Validate required fields
	if config.JWTSecret == "default-secret-change-in-production" {
		log.Println("⚠️  WARNING: Using default JWT secret. Set JWT_SECRET in production!")
	}

	AppConfig = config
	return config
}

// IsDevelopment returns true if running in development mode
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
}

// IsProduction returns true if running in production mode
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}
