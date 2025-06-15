package utils

import (
	"encoding/json"
	"io"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSuccessResponse(t *testing.T) {
	tests := []struct {
		name string
		data interface{}
	}{
		{
			name: "string data",
			data: "test message",
		},
		{
			name: "map data",
			data: map[string]interface{}{
				"id":   123,
				"name": "テストユーザー",
			},
		},
		{
			name: "nil data",
			data: nil,
		},
		{
			name: "slice data",
			data: []string{"item1", "item2", "item3"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := SuccessResponse(tt.data)

			assert.True(t, response.Success)
			assert.Equal(t, tt.data, response.Data)
			assert.Nil(t, response.Error)
			assert.Empty(t, response.RequestID)
		})
	}
}

func TestErrorResponse(t *testing.T) {
	tests := []struct {
		name string
		err  *AppError
	}{
		{
			name: "validation error",
			err:  NewValidationError("入力データが無効です"),
		},
		{
			name: "internal error",
			err:  NewInternalError("内部エラーが発生しました"),
		},
		{
			name: "error with details",
			err: NewValidationError("検証エラー").
				WithDetail("email", "invalid_format", "有効なメールアドレスを入力してください", "invalid-email"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := ErrorResponse(tt.err)

			assert.False(t, response.Success)
			assert.Nil(t, response.Data)
			assert.Equal(t, tt.err, response.Error)
			assert.Empty(t, response.RequestID)
		})
	}
}

func TestAPIResponse_WithRequestID(t *testing.T) {
	t.Run("success response with request ID", func(t *testing.T) {
		response := SuccessResponse("test data")
		requestID := "req-123456"

		result := response.WithRequestID(requestID)

		// Should return the same instance
		assert.Same(t, response, result)
		assert.Equal(t, requestID, response.RequestID)
	})

	t.Run("error response with request ID", func(t *testing.T) {
		err := NewValidationError("テストエラー")
		response := ErrorResponse(err)
		requestID := "req-789012"

		result := response.WithRequestID(requestID)

		// Should return the same instance
		assert.Same(t, response, result)
		assert.Equal(t, requestID, response.RequestID)
		assert.Equal(t, requestID, response.Error.RequestID)
	})
}

func TestGetHTTPStatusCode(t *testing.T) {
	tests := []struct {
		name         string
		code         ErrorCode
		expectedCode int
	}{
		{
			name:         "validation error",
			code:         ValidationError,
			expectedCode: fiber.StatusBadRequest,
		},
		{
			name:         "invalid input",
			code:         InvalidInput,
			expectedCode: fiber.StatusBadRequest,
		},
		{
			name:         "missing field",
			code:         MissingField,
			expectedCode: fiber.StatusBadRequest,
		},
		{
			name:         "invalid format",
			code:         InvalidFormat,
			expectedCode: fiber.StatusBadRequest,
		},
		{
			name:         "unauthorized",
			code:         Unauthorized,
			expectedCode: fiber.StatusUnauthorized,
		},
		{
			name:         "invalid credentials",
			code:         InvalidCredentials,
			expectedCode: fiber.StatusUnauthorized,
		},
		{
			name:         "forbidden",
			code:         Forbidden,
			expectedCode: fiber.StatusForbidden,
		},
		{
			name:         "service unavailable",
			code:         ServiceUnavailable,
			expectedCode: fiber.StatusServiceUnavailable,
		},
		{
			name:         "external API error",
			code:         ExternalAPIError,
			expectedCode: fiber.StatusBadGateway,
		},
		{
			name:         "network error",
			code:         NetworkError,
			expectedCode: fiber.StatusBadGateway,
		},
		{
			name:         "database error",
			code:         DatabaseError,
			expectedCode: fiber.StatusInternalServerError,
		},
		{
			name:         "internal error",
			code:         InternalError,
			expectedCode: fiber.StatusInternalServerError,
		},
		{
			name:         "processing error",
			code:         ProcessingError,
			expectedCode: fiber.StatusInternalServerError,
		},
		{
			name:         "unknown error code",
			code:         ErrorCode("unknown_error"),
			expectedCode: fiber.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			statusCode := getHTTPStatusCode(tt.code)
			assert.Equal(t, tt.expectedCode, statusCode)
		})
	}
}

func TestNewHealthResponse(t *testing.T) {
	tests := []struct {
		name   string
		status string
	}{
		{
			name:   "healthy status",
			status: "healthy",
		},
		{
			name:   "degraded status",
			status: "degraded",
		},
		{
			name:   "unhealthy status",
			status: "unhealthy",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response := NewHealthResponse(tt.status)

			assert.Equal(t, tt.status, response.Status)
			assert.NotEmpty(t, response.Timestamp)
			assert.Empty(t, response.Version)
			assert.NotNil(t, response.Services)
			assert.Empty(t, response.Services)

			// Check timestamp format
			_, err := time.Parse(time.RFC3339, response.Timestamp)
			assert.NoError(t, err, "Timestamp should be in RFC3339 format")

			// Check that timestamp is recent (within last second)
			parsedTime, _ := time.Parse(time.RFC3339, response.Timestamp)
			assert.WithinDuration(t, time.Now(), parsedTime, time.Second)
		})
	}
}

func TestHealthResponse_AddServiceStatus(t *testing.T) {
	response := NewHealthResponse("healthy")

	// Test adding first service
	result := response.AddServiceStatus("database", "healthy")
	assert.Same(t, response, result) // Should return same instance
	assert.Equal(t, "healthy", response.Services["database"])

	// Test adding multiple services
	response.AddServiceStatus("redis", "healthy")
	response.AddServiceStatus("openai", "degraded")

	assert.Len(t, response.Services, 3)
	assert.Equal(t, "healthy", response.Services["database"])
	assert.Equal(t, "healthy", response.Services["redis"])
	assert.Equal(t, "degraded", response.Services["openai"])

	// Test updating existing service
	response.AddServiceStatus("database", "degraded")
	assert.Equal(t, "degraded", response.Services["database"])
}

func TestHealthResponse_SetVersion(t *testing.T) {
	response := NewHealthResponse("healthy")

	result := response.SetVersion("v1.2.3")
	assert.Same(t, response, result) // Should return same instance
	assert.Equal(t, "v1.2.3", response.Version)

	// Test updating version
	response.SetVersion("v2.0.0")
	assert.Equal(t, "v2.0.0", response.Version)
}

func TestHealthResponse_Chaining(t *testing.T) {
	// Test method chaining
	response := NewHealthResponse("healthy").
		SetVersion("v1.0.0").
		AddServiceStatus("database", "healthy").
		AddServiceStatus("redis", "healthy").
		AddServiceStatus("openai", "degraded")

	assert.Equal(t, "healthy", response.Status)
	assert.Equal(t, "v1.0.0", response.Version)
	assert.Len(t, response.Services, 3)
	assert.Equal(t, "healthy", response.Services["database"])
	assert.Equal(t, "healthy", response.Services["redis"])
	assert.Equal(t, "degraded", response.Services["openai"])
}

func TestAPIResponseJSON(t *testing.T) {
	t.Run("success response JSON serialization", func(t *testing.T) {
		data := map[string]interface{}{
			"id":   123,
			"name": "テストユーザー",
		}
		response := SuccessResponse(data).WithRequestID("req-123")

		jsonData, err := json.Marshal(response)
		require.NoError(t, err)

		var result map[string]interface{}
		err = json.Unmarshal(jsonData, &result)
		require.NoError(t, err)

		assert.True(t, result["success"].(bool))
		assert.Equal(t, "req-123", result["request_id"])
		assert.NotNil(t, result["data"])
		assert.Nil(t, result["error"])
	})

	t.Run("error response JSON serialization", func(t *testing.T) {
		err := NewValidationError("入力データが無効です").
			WithDetail("email", "invalid_format", "有効なメールアドレスを入力してください", "test@")
		response := ErrorResponse(err).WithRequestID("req-456")

		jsonData, jsonErr := json.Marshal(response)
		require.NoError(t, jsonErr)

		var result map[string]interface{}
		jsonErr = json.Unmarshal(jsonData, &result)
		require.NoError(t, jsonErr)

		assert.False(t, result["success"].(bool))
		assert.Equal(t, "req-456", result["request_id"])
		assert.Nil(t, result["data"])
		assert.NotNil(t, result["error"])
	})
}

// Integration test with actual Fiber app to test the HTTP handler functions
func TestIntegrationAPIResponse(t *testing.T) {
	app := fiber.New()

	// Success endpoint
	app.Get("/success", func(c *fiber.Ctx) error {
		c.Locals("requestId", "req-integration-123")
		return SendSuccess(c, map[string]string{"message": "success"})
	})

	// Error endpoint
	app.Get("/error", func(c *fiber.Ctx) error {
		c.Locals("requestId", "req-integration-456")
		err := NewValidationError("入力エラー").
			WithDetail("field", "code", "message", "value")
		return SendError(c, err)
	})

	// Validation error endpoint
	app.Get("/validation", func(c *fiber.Ctx) error {
		return SendValidationError(c, "email", "無効なメール形式", "invalid@")
	})

	// Internal error endpoint
	app.Get("/internal", func(c *fiber.Ctx) error {
		return SendInternalError(c, "データベース接続エラー")
	})

	// Service unavailable endpoint
	app.Get("/service-unavailable", func(c *fiber.Ctx) error {
		return SendServiceUnavailableError(c, "OpenAI")
	})

	t.Run("success endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/success", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		defer func() { _ = resp.Body.Close() }()

		assert.Equal(t, fiber.StatusOK, resp.StatusCode)

		body, err := io.ReadAll(resp.Body)
		require.NoError(t, err)

		var response APIResponse
		err = json.Unmarshal(body, &response)
		require.NoError(t, err)

		assert.True(t, response.Success)
		assert.Equal(t, "req-integration-123", response.RequestID)
		assert.NotNil(t, response.Data)
		assert.Nil(t, response.Error)
	})

	t.Run("error endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/error", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		defer func() { _ = resp.Body.Close() }()

		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)

		body, err := io.ReadAll(resp.Body)
		require.NoError(t, err)

		var response APIResponse
		err = json.Unmarshal(body, &response)
		require.NoError(t, err)

		assert.False(t, response.Success)
		assert.Equal(t, "req-integration-456", response.RequestID)
		assert.Nil(t, response.Data)
		assert.NotNil(t, response.Error)
		assert.Equal(t, "req-integration-456", response.Error.RequestID)
	})

	t.Run("validation error endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/validation", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		defer func() { _ = resp.Body.Close() }()

		assert.Equal(t, fiber.StatusBadRequest, resp.StatusCode)

		body, err := io.ReadAll(resp.Body)
		require.NoError(t, err)

		var response APIResponse
		err = json.Unmarshal(body, &response)
		require.NoError(t, err)

		assert.False(t, response.Success)
		assert.NotNil(t, response.Error)
		assert.Equal(t, ValidationError, response.Error.Code)
		assert.Len(t, response.Error.Details, 1)
		assert.Equal(t, "email", response.Error.Details[0].Field)
	})

	t.Run("internal error endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/internal", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		defer func() { _ = resp.Body.Close() }()

		assert.Equal(t, fiber.StatusInternalServerError, resp.StatusCode)

		body, err := io.ReadAll(resp.Body)
		require.NoError(t, err)

		var response APIResponse
		err = json.Unmarshal(body, &response)
		require.NoError(t, err)

		assert.False(t, response.Success)
		assert.NotNil(t, response.Error)
		assert.Equal(t, InternalError, response.Error.Code)
	})

	t.Run("service unavailable endpoint", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/service-unavailable", nil)
		resp, err := app.Test(req)
		require.NoError(t, err)
		defer func() { _ = resp.Body.Close() }()

		assert.Equal(t, fiber.StatusServiceUnavailable, resp.StatusCode)

		body, err := io.ReadAll(resp.Body)
		require.NoError(t, err)

		var response APIResponse
		err = json.Unmarshal(body, &response)
		require.NoError(t, err)

		assert.False(t, response.Success)
		assert.NotNil(t, response.Error)
		assert.Equal(t, ServiceUnavailable, response.Error.Code)
		assert.Contains(t, response.Error.Message, "OpenAI")
	})
}

func TestHealthResponseNilServices(t *testing.T) {
	// Test adding service status when Services is nil
	response := &HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now().Format(time.RFC3339),
		Services:  nil, // Explicitly set to nil
	}

	result := response.AddServiceStatus("test", "healthy")
	assert.Same(t, response, result)
	assert.NotNil(t, response.Services)
	assert.Equal(t, "healthy", response.Services["test"])
}

func TestResponseStructFields(t *testing.T) {
	// Test that response structs have expected JSON tags
	t.Run("APIResponse struct fields", func(t *testing.T) {
		response := APIResponse{
			Success:   true,
			Data:      "test",
			Error:     nil,
			RequestID: "req-123",
		}

		jsonData, err := json.Marshal(response)
		require.NoError(t, err)

		var result map[string]interface{}
		err = json.Unmarshal(jsonData, &result)
		require.NoError(t, err)

		// Check that all expected fields are present
		assert.Contains(t, result, "success")
		assert.Contains(t, result, "data")
		assert.Contains(t, result, "request_id")
		// Error should be omitted when nil
		assert.NotContains(t, result, "error")
	})

	t.Run("HealthResponse struct fields", func(t *testing.T) {
		response := HealthResponse{
			Status:    "healthy",
			Timestamp: time.Now().Format(time.RFC3339),
			Version:   "v1.0.0",
			Services:  map[string]string{"db": "healthy"},
		}

		jsonData, err := json.Marshal(response)
		require.NoError(t, err)

		var result map[string]interface{}
		err = json.Unmarshal(jsonData, &result)
		require.NoError(t, err)

		// Check that all expected fields are present
		assert.Contains(t, result, "status")
		assert.Contains(t, result, "timestamp")
		assert.Contains(t, result, "version")
		assert.Contains(t, result, "services")
	})
}
