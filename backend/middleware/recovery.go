package middleware

import (
	"fmt"
	"log"
	"runtime/debug"
	"time"

	"github.com/gofiber/fiber/v2"
	"potarin-backend/utils"
)

// Recovery middleware to handle panics gracefully
func Recovery() fiber.Handler {
	return func(c *fiber.Ctx) error {
		defer func() {
			if r := recover(); r != nil {
				// Log the panic with stack trace
				logPanic(c, r)

				// Create internal error response
				err := utils.NewInternalError("予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください。")

				// Add request context to error
				if requestID := c.Locals("requestId"); requestID != nil {
					if id, ok := requestID.(string); ok {
						err = err.WithRequestID(id)
					}
				}

				// Send error response
				utils.SendError(c, err)
			}
		}()

		return c.Next()
	}
}

// logPanic logs panic information with context
func logPanic(c *fiber.Ctx, r interface{}) {
	timestamp := time.Now().Format(time.RFC3339)
	requestID := getRequestID(c)
	method := c.Method()
	path := c.Path()
	userAgent := c.Get("User-Agent")
	ip := c.IP()

	// Get stack trace
	stack := string(debug.Stack())

	// Log panic details
	log.Printf(`
[PANIC RECOVERED] %s
Request ID: %s
Time: %s
Method: %s
Path: %s
IP: %s
User-Agent: %s
Panic: %v

Stack Trace:
%s
========================================
`,
		"アプリケーションでパニックが発生しました",
		requestID,
		timestamp,
		method,
		path,
		ip,
		userAgent,
		r,
		stack,
	)
}

// getRequestID safely retrieves request ID from context
func getRequestID(c *fiber.Ctx) string {
	if requestID := c.Locals("requestId"); requestID != nil {
		if id, ok := requestID.(string); ok {
			return id
		}
	}
	return "unknown"
}

// RecoveryWithConfig allows customization of recovery behavior
type RecoveryConfig struct {
	// Enable stack trace logging
	EnableStackTrace bool

	// Custom error message
	ErrorMessage string

	// Custom error handler
	ErrorHandler func(*fiber.Ctx, interface{}) error
}

// RecoveryWithConfig creates a recovery middleware with custom configuration
func RecoveryWithConfig(config RecoveryConfig) fiber.Handler {
	// Set defaults
	if config.ErrorMessage == "" {
		config.ErrorMessage = "予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください。"
	}

	return func(c *fiber.Ctx) error {
		defer func() {
			if r := recover(); r != nil {
				// Log panic if stack trace is enabled
				if config.EnableStackTrace {
					logPanic(c, r)
				} else {
					log.Printf("[PANIC RECOVERED] %v", r)
				}

				// Use custom error handler if provided
				if config.ErrorHandler != nil {
					if err := config.ErrorHandler(c, r); err != nil {
						log.Printf("Error in custom panic handler: %v", err)
					}
					return
				}

				// Default error response
				err := utils.NewInternalError(config.ErrorMessage)

				if requestID := c.Locals("requestId"); requestID != nil {
					if id, ok := requestID.(string); ok {
						err = err.WithRequestID(id)
					}
				}

				utils.SendError(c, err)
			}
		}()

		return c.Next()
	}
}

// PanicToError converts a panic to a structured error
func PanicToError(r interface{}) *utils.AppError {
	var message string

	switch v := r.(type) {
	case string:
		message = v
	case error:
		message = v.Error()
	default:
		message = fmt.Sprintf("%v", v)
	}

	return utils.NewInternalError("パニックが発生しました: "+message).
		WithDetail("panic_value", "panic", message, r)
}
