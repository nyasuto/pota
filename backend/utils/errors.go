package utils

import (
	"fmt"
	"time"
)

// ErrorCode represents different types of errors
type ErrorCode string

const (
	// Validation errors
	ValidationError ErrorCode = "validation_error"
	InvalidInput    ErrorCode = "invalid_input"
	MissingField    ErrorCode = "missing_field"
	InvalidFormat   ErrorCode = "invalid_format"

	// Business logic errors
	ServiceUnavailable ErrorCode = "service_unavailable"
	ExternalAPIError   ErrorCode = "external_api_error"
	ProcessingError    ErrorCode = "processing_error"

	// System errors
	InternalError ErrorCode = "internal_error"
	DatabaseError ErrorCode = "database_error"
	NetworkError  ErrorCode = "network_error"

	// Authentication errors
	Unauthorized       ErrorCode = "unauthorized"
	Forbidden          ErrorCode = "forbidden"
	InvalidCredentials ErrorCode = "invalid_credentials"
)

// ErrorDetail provides specific information about what went wrong
type ErrorDetail struct {
	Field   string `json:"field,omitempty"`
	Code    string `json:"code,omitempty"`
	Message string `json:"message,omitempty"`
	Value   any    `json:"value,omitempty"`
}

// AppError represents a structured application error
type AppError struct {
	Code      ErrorCode     `json:"error"`
	Message   string        `json:"message"`
	Details   []ErrorDetail `json:"details,omitempty"`
	Timestamp time.Time     `json:"timestamp"`
	RequestID string        `json:"request_id,omitempty"`
}

// Error implements the error interface
func (e *AppError) Error() string {
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

// NewAppError creates a new AppError
func NewAppError(code ErrorCode, message string) *AppError {
	return &AppError{
		Code:      code,
		Message:   message,
		Timestamp: time.Now(),
	}
}

// WithDetail adds a detail to the error
func (e *AppError) WithDetail(field, code, message string, value any) *AppError {
	if e.Details == nil {
		e.Details = make([]ErrorDetail, 0)
	}
	e.Details = append(e.Details, ErrorDetail{
		Field:   field,
		Code:    code,
		Message: message,
		Value:   value,
	})
	return e
}

// WithRequestID adds a request ID to the error
func (e *AppError) WithRequestID(requestID string) *AppError {
	e.RequestID = requestID
	return e
}

// Common error constructors with Japanese messages
func NewValidationError(message string) *AppError {
	if message == "" {
		message = "入力データが無効です"
	}
	return NewAppError(ValidationError, message)
}

func NewInternalError(message string) *AppError {
	if message == "" {
		message = "内部エラーが発生しました"
	}
	return NewAppError(InternalError, message)
}

func NewServiceUnavailableError(service string) *AppError {
	message := "サービスが一時的に利用できません"
	if service != "" {
		message = fmt.Sprintf("%sサービスが一時的に利用できません", service)
	}
	return NewAppError(ServiceUnavailable, message)
}

func NewExternalAPIError(service string, err error) *AppError {
	message := "外部サービスとの通信でエラーが発生しました"
	if service != "" {
		message = fmt.Sprintf("%sとの通信でエラーが発生しました", service)
	}
	appErr := NewAppError(ExternalAPIError, message)
	if err != nil {
		appErr = appErr.WithDetail("external_error", "api_failure", err.Error(), nil)
	}
	return appErr
}

func NewProcessingError(message string) *AppError {
	if message == "" {
		message = "処理中にエラーが発生しました"
	}
	return NewAppError(ProcessingError, message)
}

// Error messages in Japanese
var ErrorMessages = map[ErrorCode]string{
	ValidationError:    "入力データが無効です",
	InvalidInput:       "無効な入力です",
	MissingField:       "必須フィールドが不足しています",
	InvalidFormat:      "データ形式が正しくありません",
	ServiceUnavailable: "サービスが一時的に利用できません",
	ExternalAPIError:   "外部サービスでエラーが発生しました",
	ProcessingError:    "処理中にエラーが発生しました",
	InternalError:      "内部エラーが発生しました",
	DatabaseError:      "データベースエラーが発生しました",
	NetworkError:       "ネットワークエラーが発生しました",
	Unauthorized:       "認証が必要です",
	Forbidden:          "アクセスが拒否されました",
	InvalidCredentials: "認証情報が無効です",
}

// GetErrorMessage returns a Japanese error message for the given code
func GetErrorMessage(code ErrorCode) string {
	if msg, exists := ErrorMessages[code]; exists {
		return msg
	}
	return "不明なエラーが発生しました"
}
