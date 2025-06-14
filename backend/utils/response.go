package utils

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

// APIResponse represents a standardized API response
type APIResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data,omitempty"`
	Error     *AppError   `json:"error,omitempty"`
	RequestID string      `json:"request_id,omitempty"`
}

// SuccessResponse creates a successful API response
func SuccessResponse(data interface{}) *APIResponse {
	return &APIResponse{
		Success: true,
		Data:    data,
	}
}

// ErrorResponse creates an error API response
func ErrorResponse(err *AppError) *APIResponse {
	return &APIResponse{
		Success: false,
		Error:   err,
	}
}

// WithRequestID adds a request ID to the response
func (r *APIResponse) WithRequestID(requestID string) *APIResponse {
	r.RequestID = requestID
	if r.Error != nil {
		r.Error.RequestID = requestID
	}
	return r
}

// SendSuccess sends a successful response
func SendSuccess(c *fiber.Ctx, data interface{}) error {
	response := SuccessResponse(data)

	// Add request ID if available
	if requestID := c.Locals("requestId"); requestID != nil {
		if id, ok := requestID.(string); ok {
			response = response.WithRequestID(id)
		}
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// SendError sends an error response with appropriate HTTP status code
func SendError(c *fiber.Ctx, err *AppError) error {
	response := ErrorResponse(err)

	// Add request ID if available
	if requestID := c.Locals("requestId"); requestID != nil {
		if id, ok := requestID.(string); ok {
			response = response.WithRequestID(id)
		}
	}

	// Determine HTTP status code based on error type
	statusCode := getHTTPStatusCode(err.Code)

	return c.Status(statusCode).JSON(response)
}

// SendValidationError sends a validation error response
func SendValidationError(c *fiber.Ctx, field, message string, value interface{}) error {
	err := NewValidationError("入力データが無効です").
		WithDetail(field, "invalid_value", message, value)

	return SendError(c, err)
}

// SendInternalError sends an internal server error response
func SendInternalError(c *fiber.Ctx, message string) error {
	err := NewInternalError(message)
	return SendError(c, err)
}

// SendServiceUnavailableError sends a service unavailable error response
func SendServiceUnavailableError(c *fiber.Ctx, service string) error {
	err := NewServiceUnavailableError(service)
	return SendError(c, err)
}

// getHTTPStatusCode maps error codes to HTTP status codes
func getHTTPStatusCode(code ErrorCode) int {
	switch code {
	case ValidationError, InvalidInput, MissingField, InvalidFormat:
		return fiber.StatusBadRequest
	case Unauthorized, InvalidCredentials:
		return fiber.StatusUnauthorized
	case Forbidden:
		return fiber.StatusForbidden
	case ServiceUnavailable:
		return fiber.StatusServiceUnavailable
	case ExternalAPIError, NetworkError:
		return fiber.StatusBadGateway
	case DatabaseError, InternalError, ProcessingError:
		return fiber.StatusInternalServerError
	default:
		return fiber.StatusInternalServerError
	}
}

// Health check response structure
type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp string            `json:"timestamp"`
	Version   string            `json:"version,omitempty"`
	Services  map[string]string `json:"services,omitempty"`
}

// NewHealthResponse creates a health check response
func NewHealthResponse(status string) *HealthResponse {
	return &HealthResponse{
		Status:    status,
		Timestamp: time.Now().Format(time.RFC3339),
		Services:  make(map[string]string),
	}
}

// AddServiceStatus adds a service status to health response
func (h *HealthResponse) AddServiceStatus(service, status string) *HealthResponse {
	if h.Services == nil {
		h.Services = make(map[string]string)
	}
	h.Services[service] = status
	return h
}

// SetVersion sets the application version
func (h *HealthResponse) SetVersion(version string) *HealthResponse {
	h.Version = version
	return h
}
