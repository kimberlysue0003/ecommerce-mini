package utils

import (
	"crypto/rand"
	"encoding/base32"
	"strings"
	"time"
)

// GenerateID generates a unique ID similar to Prisma's cuid
// Format: c + timestamp + random string (total ~25-30 chars)
func GenerateID() string {
	// Get current timestamp in milliseconds
	timestamp := time.Now().UnixNano() / 1000000

	// Generate random bytes
	randomBytes := make([]byte, 10)
	rand.Read(randomBytes)

	// Encode to base32 and make lowercase
	randomStr := strings.ToLower(base32.StdEncoding.EncodeToString(randomBytes))
	randomStr = strings.TrimRight(randomStr, "=")

	// Combine: 'c' prefix + timestamp + random
	id := "c" + base32.StdEncoding.EncodeToString([]byte(string(rune(timestamp))))[:8] + randomStr[:12]

	return strings.ToLower(id)
}
