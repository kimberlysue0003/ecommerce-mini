package utils

import (
	"fmt"
	"log"
	"os"
	"time"
)

// Logger provides colored console logging
type Logger struct {
	infoLogger  *log.Logger
	errorLogger *log.Logger
	warnLogger  *log.Logger
	debugLogger *log.Logger
}

var Log *Logger

func init() {
	Log = &Logger{
		infoLogger:  log.New(os.Stdout, "", 0),
		errorLogger: log.New(os.Stderr, "", 0),
		warnLogger:  log.New(os.Stdout, "", 0),
		debugLogger: log.New(os.Stdout, "", 0),
	}
}

// Info logs informational messages
func (l *Logger) Info(msg string, args ...interface{}) {
	timestamp := time.Now().Format("15:04:05")
	message := fmt.Sprintf(msg, args...)
	l.infoLogger.Printf("ℹ️  [%s] %s", timestamp, message)
}

// Success logs success messages
func (l *Logger) Success(msg string, args ...interface{}) {
	timestamp := time.Now().Format("15:04:05")
	message := fmt.Sprintf(msg, args...)
	l.infoLogger.Printf("✅ [%s] %s", timestamp, message)
}

// Error logs error messages
func (l *Logger) Error(msg string, args ...interface{}) {
	timestamp := time.Now().Format("15:04:05")
	message := fmt.Sprintf(msg, args...)
	l.errorLogger.Printf("❌ [%s] %s", timestamp, message)
}

// Warn logs warning messages
func (l *Logger) Warn(msg string, args ...interface{}) {
	timestamp := time.Now().Format("15:04:05")
	message := fmt.Sprintf(msg, args...)
	l.warnLogger.Printf("⚠️  [%s] %s", timestamp, message)
}

// Debug logs debug messages
func (l *Logger) Debug(msg string, args ...interface{}) {
	timestamp := time.Now().Format("15:04:05")
	message := fmt.Sprintf(msg, args...)
	l.debugLogger.Printf("🔍 [%s] %s", timestamp, message)
}
