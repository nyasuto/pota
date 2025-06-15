package utils

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewAppError(t *testing.T) {
	tests := []struct {
		name    string
		code    ErrorCode
		message string
	}{
		{
			name:    "validation error",
			code:    ValidationError,
			message: "入力データが無効です",
		},
		{
			name:    "internal error",
			code:    InternalError,
			message: "内部エラーが発生しました",
		},
		{
			name:    "custom message",
			code:    ProcessingError,
			message: "カスタムエラーメッセージ",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := NewAppError(tt.code, tt.message)

			assert.Equal(t, tt.code, err.Code)
			assert.Equal(t, tt.message, err.Message)
			assert.NotNil(t, err.Timestamp)
			assert.Empty(t, err.Details)
			assert.Empty(t, err.RequestID)

			// Check that timestamp is recent (within last second)
			assert.WithinDuration(t, time.Now(), err.Timestamp, time.Second)
		})
	}
}

func TestAppError_Error(t *testing.T) {
	tests := []struct {
		name     string
		code     ErrorCode
		message  string
		expected string
	}{
		{
			name:     "validation error",
			code:     ValidationError,
			message:  "入力データが無効です",
			expected: "[validation_error] 入力データが無効です",
		},
		{
			name:     "internal error",
			code:     InternalError,
			message:  "内部エラーが発生しました",
			expected: "[internal_error] 内部エラーが発生しました",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := NewAppError(tt.code, tt.message)
			assert.Equal(t, tt.expected, err.Error())
		})
	}
}

func TestAppError_WithDetail(t *testing.T) {
	err := NewAppError(ValidationError, "入力データが無効です")

	result := err.WithDetail("email", "invalid_format", "有効なメールアドレスを入力してください", "invalid-email")

	// Should return the same instance
	assert.Same(t, err, result)

	// Should have the detail added
	require.Len(t, err.Details, 1)

	detail := err.Details[0]
	assert.Equal(t, "email", detail.Field)
	assert.Equal(t, "invalid_format", detail.Code)
	assert.Equal(t, "有効なメールアドレスを入力してください", detail.Message)
	assert.Equal(t, "invalid-email", detail.Value)

	// Test adding multiple details
	err.WithDetail("password", "too_short", "パスワードは8文字以上にしてください", "abc")

	require.Len(t, err.Details, 2)
	assert.Equal(t, "password", err.Details[1].Field)
}

func TestAppError_WithRequestID(t *testing.T) {
	err := NewAppError(ValidationError, "入力データが無効です")
	requestID := "req-123456"

	result := err.WithRequestID(requestID)

	// Should return the same instance
	assert.Same(t, err, result)
	assert.Equal(t, requestID, err.RequestID)
}

func TestNewValidationError(t *testing.T) {
	tests := []struct {
		name     string
		message  string
		expected string
	}{
		{
			name:     "custom message",
			message:  "カスタム検証エラー",
			expected: "カスタム検証エラー",
		},
		{
			name:     "empty message uses default",
			message:  "",
			expected: "入力データが無効です",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := NewValidationError(tt.message)

			assert.Equal(t, ValidationError, err.Code)
			assert.Equal(t, tt.expected, err.Message)
		})
	}
}

func TestNewInternalError(t *testing.T) {
	tests := []struct {
		name     string
		message  string
		expected string
	}{
		{
			name:     "custom message",
			message:  "カスタム内部エラー",
			expected: "カスタム内部エラー",
		},
		{
			name:     "empty message uses default",
			message:  "",
			expected: "内部エラーが発生しました",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := NewInternalError(tt.message)

			assert.Equal(t, InternalError, err.Code)
			assert.Equal(t, tt.expected, err.Message)
		})
	}
}

func TestNewServiceUnavailableError(t *testing.T) {
	tests := []struct {
		name     string
		service  string
		expected string
	}{
		{
			name:     "with service name",
			service:  "OpenAI",
			expected: "OpenAIサービスが一時的に利用できません",
		},
		{
			name:     "empty service name",
			service:  "",
			expected: "サービスが一時的に利用できません",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := NewServiceUnavailableError(tt.service)

			assert.Equal(t, ServiceUnavailable, err.Code)
			assert.Equal(t, tt.expected, err.Message)
		})
	}
}

func TestNewExternalAPIError(t *testing.T) {
	tests := []struct {
		name        string
		service     string
		inputError  error
		expectedMsg string
		hasDetail   bool
	}{
		{
			name:        "with service and error",
			service:     "OpenAI",
			inputError:  assert.AnError,
			expectedMsg: "OpenAIとの通信でエラーが発生しました",
			hasDetail:   true,
		},
		{
			name:        "empty service name",
			service:     "",
			inputError:  assert.AnError,
			expectedMsg: "外部サービスとの通信でエラーが発生しました",
			hasDetail:   true,
		},
		{
			name:        "nil error",
			service:     "TestService",
			inputError:  nil,
			expectedMsg: "TestServiceとの通信でエラーが発生しました",
			hasDetail:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := NewExternalAPIError(tt.service, tt.inputError)

			assert.Equal(t, ExternalAPIError, err.Code)
			assert.Equal(t, tt.expectedMsg, err.Message)

			if tt.hasDetail {
				require.Len(t, err.Details, 1)
				detail := err.Details[0]
				assert.Equal(t, "external_error", detail.Field)
				assert.Equal(t, "api_failure", detail.Code)
				assert.Equal(t, tt.inputError.Error(), detail.Message)
			} else {
				assert.Empty(t, err.Details)
			}
		})
	}
}

func TestNewProcessingError(t *testing.T) {
	tests := []struct {
		name     string
		message  string
		expected string
	}{
		{
			name:     "custom message",
			message:  "カスタム処理エラー",
			expected: "カスタム処理エラー",
		},
		{
			name:     "empty message uses default",
			message:  "",
			expected: "処理中にエラーが発生しました",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := NewProcessingError(tt.message)

			assert.Equal(t, ProcessingError, err.Code)
			assert.Equal(t, tt.expected, err.Message)
		})
	}
}

func TestGetErrorMessage(t *testing.T) {
	tests := []struct {
		name     string
		code     ErrorCode
		expected string
	}{
		{
			name:     "validation error",
			code:     ValidationError,
			expected: "入力データが無効です",
		},
		{
			name:     "internal error",
			code:     InternalError,
			expected: "内部エラーが発生しました",
		},
		{
			name:     "unknown error code",
			code:     ErrorCode("unknown_error"),
			expected: "不明なエラーが発生しました",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			message := GetErrorMessage(tt.code)
			assert.Equal(t, tt.expected, message)
		})
	}
}

func TestErrorMessages(t *testing.T) {
	// Test that all defined error codes have corresponding messages
	expectedCodes := []ErrorCode{
		ValidationError,
		InvalidInput,
		MissingField,
		InvalidFormat,
		ServiceUnavailable,
		ExternalAPIError,
		ProcessingError,
		InternalError,
		DatabaseError,
		NetworkError,
		Unauthorized,
		Forbidden,
		InvalidCredentials,
	}

	for _, code := range expectedCodes {
		t.Run(string(code), func(t *testing.T) {
			message, exists := ErrorMessages[code]
			assert.True(t, exists, "Error message not found for code: %s", code)
			assert.NotEmpty(t, message, "Error message is empty for code: %s", code)
		})
	}
}

func TestAppError_Chaining(t *testing.T) {
	// Test method chaining
	err := NewAppError(ValidationError, "テストエラー").
		WithDetail("field1", "error1", "メッセージ1", "値1").
		WithDetail("field2", "error2", "メッセージ2", "値2").
		WithRequestID("req-test-123")

	assert.Equal(t, ValidationError, err.Code)
	assert.Equal(t, "テストエラー", err.Message)
	assert.Equal(t, "req-test-123", err.RequestID)
	assert.Len(t, err.Details, 2)

	// Verify details
	assert.Equal(t, "field1", err.Details[0].Field)
	assert.Equal(t, "field2", err.Details[1].Field)
}
