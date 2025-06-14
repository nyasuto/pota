package middleware

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// LogLevel represents different log levels
type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
	FATAL
)

// String returns string representation of log level
func (l LogLevel) String() string {
	switch l {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARN:
		return "WARN"
	case ERROR:
		return "ERROR"
	case FATAL:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}

// Logger represents a structured logger
type Logger struct {
	level  LogLevel
	logger *log.Logger
}

// NewLogger creates a new structured logger
func NewLogger(level LogLevel) *Logger {
	return &Logger{
		level:  level,
		logger: log.New(os.Stdout, "", 0),
	}
}

// logMessage formats and logs a message
func (l *Logger) logMessage(level LogLevel, message string, fields map[string]interface{}) {
	if level < l.level {
		return
	}

	timestamp := time.Now().Format(time.RFC3339)
	levelStr := level.String()

	// Format fields
	fieldsStr := ""
	if len(fields) > 0 {
		fieldsStr = " | "
		for key, value := range fields {
			fieldsStr += fmt.Sprintf("%s=%v ", key, value)
		}
	}

	logLine := fmt.Sprintf("[%s] %s | %s%s", timestamp, levelStr, message, fieldsStr)
	l.logger.Println(logLine)
}

// Debug logs a debug message
func (l *Logger) Debug(message string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.logMessage(DEBUG, message, f)
}

// Info logs an info message
func (l *Logger) Info(message string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.logMessage(INFO, message, f)
}

// Warn logs a warning message
func (l *Logger) Warn(message string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.logMessage(WARN, message, f)
}

// Error logs an error message
func (l *Logger) Error(message string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.logMessage(ERROR, message, f)
}

// Fatal logs a fatal message and exits
func (l *Logger) Fatal(message string, fields ...map[string]interface{}) {
	var f map[string]interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	l.logMessage(FATAL, message, f)
	os.Exit(1)
}

// Global logger instance
var AppLogger = NewLogger(INFO)

// SetLogLevel sets the global log level
func SetLogLevel(level LogLevel) {
	AppLogger.level = level
}

// RequestLogger middleware for logging HTTP requests
func RequestLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Generate request ID
		requestID := uuid.New().String()
		c.Locals("requestId", requestID)

		// Log request start
		start := time.Now()
		method := c.Method()
		path := c.Path()
		ip := c.IP()
		userAgent := c.Get("User-Agent")

		AppLogger.Info("Request started", map[string]interface{}{
			"request_id": requestID,
			"method":     method,
			"path":       path,
			"ip":         ip,
			"user_agent": userAgent,
		})

		// Process request
		err := c.Next()

		// Log request completion
		duration := time.Since(start)
		status := c.Response().StatusCode()

		logLevel := INFO
		if status >= 400 && status < 500 {
			logLevel = WARN
		} else if status >= 500 {
			logLevel = ERROR
		}

		fields := map[string]interface{}{
			"request_id": requestID,
			"method":     method,
			"path":       path,
			"status":     status,
			"duration":   duration.String(),
			"ip":         ip,
		}

		if err != nil {
			fields["error"] = err.Error()
			AppLogger.Error("Request completed with error", fields)
		} else {
			message := "Request completed"
			switch logLevel {
			case WARN:
				AppLogger.Warn(message, fields)
			case ERROR:
				AppLogger.Error(message, fields)
			default:
				AppLogger.Info(message, fields)
			}
		}

		return err
	}
}

// RequestID middleware adds request ID to context
func RequestID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Check if request ID already exists
		if c.Locals("requestId") == nil {
			requestID := uuid.New().String()
			c.Locals("requestId", requestID)
		}

		// Add request ID to response header
		if requestID := c.Locals("requestId"); requestID != nil {
			if id, ok := requestID.(string); ok {
				c.Set("X-Request-ID", id)
			}
		}

		return c.Next()
	}
}

// LogError logs an application error with context
func LogError(c *fiber.Ctx, err error, message string) {
	fields := map[string]interface{}{
		"error":  err.Error(),
		"method": c.Method(),
		"path":   c.Path(),
	}

	if requestID := c.Locals("requestId"); requestID != nil {
		fields["request_id"] = requestID
	}

	AppLogger.Error(message, fields)
}

// LogInfo logs an info message with request context
func LogInfo(c *fiber.Ctx, message string, additionalFields ...map[string]interface{}) {
	fields := map[string]interface{}{
		"method": c.Method(),
		"path":   c.Path(),
	}

	if requestID := c.Locals("requestId"); requestID != nil {
		fields["request_id"] = requestID
	}

	// Merge additional fields
	if len(additionalFields) > 0 {
		for key, value := range additionalFields[0] {
			fields[key] = value
		}
	}

	AppLogger.Info(message, fields)
}

// LogWarn logs a warning message with request context
func LogWarn(c *fiber.Ctx, message string, additionalFields ...map[string]interface{}) {
	fields := map[string]interface{}{
		"method": c.Method(),
		"path":   c.Path(),
	}

	if requestID := c.Locals("requestId"); requestID != nil {
		fields["request_id"] = requestID
	}

	// Merge additional fields
	if len(additionalFields) > 0 {
		for key, value := range additionalFields[0] {
			fields[key] = value
		}
	}

	AppLogger.Warn(message, fields)
}
