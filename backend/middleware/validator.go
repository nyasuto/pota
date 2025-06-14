package middleware

import (
	"encoding/json"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"potarin-backend/utils"
)

var validate *validator.Validate

func init() {
	validate = validator.New()

	// Register custom tag name function to use json tags
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})

	// Register custom validators
	registerCustomValidators()
}

// ValidateStruct validates a struct and returns user-friendly errors
func ValidateStruct(s interface{}) *utils.AppError {
	if err := validate.Struct(s); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			appErr := utils.NewValidationError("入力データが無効です")

			for _, fieldError := range validationErrors {
				detail := convertValidationError(fieldError)
				appErr.Details = append(appErr.Details, detail)
			}

			return appErr
		}
		return utils.NewValidationError("データの検証に失敗しました")
	}
	return nil
}

// ValidateJSON validates JSON request body against a struct
func ValidateJSON(c *fiber.Ctx, out interface{}) error {
	// Parse JSON body
	if err := c.BodyParser(out); err != nil {
		return utils.SendValidationError(c, "body", "JSONの解析に失敗しました", string(c.Body()))
	}

	// Validate struct
	if err := ValidateStruct(out); err != nil {
		return utils.SendError(c, err)
	}

	return nil
}

// Validator middleware for automatic request validation
func Validator(target interface{}) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Create a new instance of the target type
		targetType := reflect.TypeOf(target)
		if targetType.Kind() == reflect.Ptr {
			targetType = targetType.Elem()
		}

		requestData := reflect.New(targetType).Interface()

		// Validate JSON request
		if err := ValidateJSON(c, requestData); err != nil {
			return err
		}

		// Store validated data in context
		c.Locals("validatedData", requestData)

		return c.Next()
	}
}

// GetValidatedData retrieves validated data from context
func GetValidatedData(c *fiber.Ctx, out interface{}) bool {
	if data := c.Locals("validatedData"); data != nil {
		// Use JSON marshal/unmarshal for type conversion
		if jsonData, err := json.Marshal(data); err == nil {
			if err := json.Unmarshal(jsonData, out); err == nil {
				return true
			}
		}
	}
	return false
}

// convertValidationError converts validator.FieldError to ErrorDetail
func convertValidationError(fe validator.FieldError) utils.ErrorDetail {
	field := fe.Field()
	tag := fe.Tag()
	param := fe.Param()
	value := fe.Value()

	// Japanese error messages for common validation tags
	var message string
	var code string

	switch tag {
	case "required":
		message = "必須項目です"
		code = "required"
	case "email":
		message = "有効なメールアドレスを入力してください"
		code = "invalid_email"
	case "min":
		message = "最小値は " + param + " です"
		code = "too_small"
	case "max":
		message = "最大値は " + param + " です"
		code = "too_large"
	case "len":
		message = "長さは " + param + " である必要があります"
		code = "invalid_length"
	case "oneof":
		message = "許可された値のいずれかを選択してください: " + param
		code = "invalid_choice"
	case "numeric":
		message = "数値を入力してください"
		code = "not_numeric"
	case "alpha":
		message = "英字のみ入力してください"
		code = "not_alpha"
	case "alphanum":
		message = "英数字のみ入力してください"
		code = "not_alphanum"
	case "url":
		message = "有効なURLを入力してください"
		code = "invalid_url"
	case "latitude":
		message = "有効な緯度を入力してください（-90から90の間）"
		code = "invalid_latitude"
	case "longitude":
		message = "有効な経度を入力してください（-180から180の間）"
		code = "invalid_longitude"
	default:
		message = "入力値が無効です"
		code = "validation_failed"
	}

	return utils.ErrorDetail{
		Field:   field,
		Code:    code,
		Message: message,
		Value:   value,
	}
}

// registerCustomValidators registers custom validation rules
func registerCustomValidators() {
	// Register latitude validator
	validate.RegisterValidation("latitude", func(fl validator.FieldLevel) bool {
		lat, ok := fl.Field().Interface().(float64)
		if !ok {
			return false
		}
		return lat >= -90 && lat <= 90
	})

	// Register longitude validator
	validate.RegisterValidation("longitude", func(fl validator.FieldLevel) bool {
		lng, ok := fl.Field().Interface().(float64)
		if !ok {
			return false
		}
		return lng >= -180 && lng <= 180
	})

	// Register course type validator
	validate.RegisterValidation("coursetype", func(fl validator.FieldLevel) bool {
		courseType, ok := fl.Field().Interface().(string)
		if !ok {
			return false
		}
		validTypes := []string{"walking", "cycling", "jogging"}
		for _, validType := range validTypes {
			if courseType == validType {
				return true
			}
		}
		return false
	})

	// Register distance validator
	validate.RegisterValidation("distance", func(fl validator.FieldLevel) bool {
		distance, ok := fl.Field().Interface().(string)
		if !ok {
			return false
		}
		validDistances := []string{"short", "medium", "long"}
		for _, validDistance := range validDistances {
			if distance == validDistance {
				return true
			}
		}
		return false
	})
}
