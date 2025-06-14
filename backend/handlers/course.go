package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"potarin-backend/middleware"
	"potarin-backend/services"
	"potarin-backend/utils"
	shared "potarin-shared"
)

type CourseHandler struct {
	openaiService *services.OpenAIService
}

func NewCourseHandler(openaiService *services.OpenAIService) *CourseHandler {
	return &CourseHandler{
		openaiService: openaiService,
	}
}

func (h *CourseHandler) GetSuggestions(c *fiber.Ctx) error {
	middleware.LogInfo(c, "Course suggestions request received")

	var request shared.SuggestionsRequest

	// Parse and validate request body
	if err := middleware.ValidateJSON(c, &request); err != nil {
		middleware.LogWarn(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return err
	}

	// Additional validation for nested structures
	if err := h.validateSuggestionsRequest(&request); err != nil {
		middleware.LogWarn(c, "Request validation failed", map[string]interface{}{
			"error": err.Error(),
		})
		return utils.SendError(c, err)
	}

	// Convert shared types to service types
	serviceRequest := services.CourseRequest{
		CourseType: request.Request.CourseType,
		Distance:   request.Request.Distance,
	}

	if request.Request.Location != nil {
		serviceRequest.Location = &services.Position{
			Latitude:  request.Request.Location.Latitude,
			Longitude: request.Request.Location.Longitude,
		}
	}

	if request.Request.Preferences != nil {
		serviceRequest.Preferences = &services.CoursePreferences{
			Scenery:    request.Request.Preferences.Scenery,
			Difficulty: request.Request.Preferences.Difficulty,
			AvoidHills: request.Request.Preferences.AvoidHills,
		}
	}

	middleware.LogInfo(c, "Calling OpenAI service for course suggestions", map[string]interface{}{
		"course_type": serviceRequest.CourseType,
		"distance":    serviceRequest.Distance,
	})

	// Call OpenAI service with error handling
	openaiResponse, err := h.openaiService.GenerateCourseSuggestions(c.Context(), serviceRequest)
	if err != nil {
		middleware.LogError(c, err, "Failed to generate course suggestions")
		return utils.SendError(c, utils.NewExternalAPIError("OpenAI", err))
	}

	// Convert service response to shared types
	suggestions := make([]shared.CourseSuggestion, len(openaiResponse.Suggestions))
	for i, suggestion := range openaiResponse.Suggestions {
		suggestions[i] = shared.CourseSuggestion{
			ID:            suggestion.ID,
			Title:         suggestion.Title,
			Description:   suggestion.Description,
			Distance:      suggestion.Distance,
			EstimatedTime: suggestion.EstimatedTime,
			Difficulty:    suggestion.Difficulty,
			CourseType:    suggestion.CourseType,
			StartPoint: shared.Position{
				Latitude:  suggestion.StartPoint.Latitude,
				Longitude: suggestion.StartPoint.Longitude,
			},
			Highlights: suggestion.Highlights,
			Summary:    suggestion.Summary,
		}
	}

	response := shared.SuggestionsResponse{
		Suggestions: suggestions,
		RequestID:   services.GenerateRequestID(),
		GeneratedAt: time.Now(),
	}

	middleware.LogInfo(c, "Course suggestions generated successfully", map[string]interface{}{
		"suggestions_count": len(suggestions),
		"request_id":        response.RequestID,
	})

	return utils.SendSuccess(c, response)
}

func (h *CourseHandler) GetDetails(c *fiber.Ctx) error {
	middleware.LogInfo(c, "Course details request received")

	var request shared.DetailsRequest

	// Parse and validate request body
	if err := middleware.ValidateJSON(c, &request); err != nil {
		middleware.LogWarn(c, "Invalid request body", map[string]interface{}{
			"error": err.Error(),
		})
		return err
	}

	// Additional validation for nested structures
	if err := h.validateDetailsRequest(&request); err != nil {
		middleware.LogWarn(c, "Request validation failed", map[string]interface{}{
			"error": err.Error(),
		})
		return utils.SendError(c, err)
	}

	// Convert shared types to service types
	suggestion := services.CourseSuggestion{
		ID:            request.Suggestion.ID,
		Title:         request.Suggestion.Title,
		Description:   request.Suggestion.Description,
		Distance:      request.Suggestion.Distance,
		EstimatedTime: request.Suggestion.EstimatedTime,
		Difficulty:    request.Suggestion.Difficulty,
		CourseType:    request.Suggestion.CourseType,
		StartPoint: services.Position{
			Latitude:  request.Suggestion.StartPoint.Latitude,
			Longitude: request.Suggestion.StartPoint.Longitude,
		},
		Highlights: request.Suggestion.Highlights,
		Summary:    request.Suggestion.Summary,
	}

	middleware.LogInfo(c, "Calling OpenAI service for course details", map[string]interface{}{
		"suggestion_id": suggestion.ID,
		"course_type":   suggestion.CourseType,
	})

	// Call OpenAI service with error handling
	openaiResponse, err := h.openaiService.GenerateCourseDetails(c.Context(), suggestion)
	if err != nil {
		middleware.LogError(c, err, "Failed to generate course details")
		return utils.SendError(c, utils.NewExternalAPIError("OpenAI", err))
	}

	// Convert service response to shared types
	waypoints := make([]shared.Waypoint, len(openaiResponse.Course.Waypoints))
	for i, waypoint := range openaiResponse.Course.Waypoints {
		waypoints[i] = shared.Waypoint{
			ID:          waypoint.ID,
			Title:       waypoint.Title,
			Description: waypoint.Description,
			Position: shared.Position{
				Latitude:  waypoint.Position.Latitude,
				Longitude: waypoint.Position.Longitude,
			},
			Type: waypoint.Type,
		}
	}

	course := shared.CourseDetails{
		ID:            openaiResponse.Course.ID,
		Title:         openaiResponse.Course.Title,
		Description:   openaiResponse.Course.Description,
		Distance:      openaiResponse.Course.Distance,
		EstimatedTime: openaiResponse.Course.EstimatedTime,
		Difficulty:    openaiResponse.Course.Difficulty,
		CourseType:    openaiResponse.Course.CourseType,
		Waypoints:     waypoints,
	}

	response := shared.DetailsResponse{
		Course:      course,
		RequestID:   services.GenerateRequestID(),
		GeneratedAt: time.Now(),
	}

	middleware.LogInfo(c, "Course details generated successfully", map[string]interface{}{
		"course_id":       course.ID,
		"waypoints_count": len(course.Waypoints),
		"request_id":      response.RequestID,
	})

	return utils.SendSuccess(c, response)
}

// validateSuggestionsRequest performs additional validation for suggestions request
func (h *CourseHandler) validateSuggestionsRequest(request *shared.SuggestionsRequest) *utils.AppError {
	if request.Request.CourseType == "" {
		return utils.NewValidationError("コースタイプが必要です").
			WithDetail("courseType", "required", "コースタイプを選択してください", nil)
	}

	validCourseTypes := []string{"walking", "cycling", "jogging"}
	isValidCourseType := false
	for _, validType := range validCourseTypes {
		if request.Request.CourseType == validType {
			isValidCourseType = true
			break
		}
	}
	if !isValidCourseType {
		return utils.NewValidationError("無効なコースタイプです").
			WithDetail("courseType", "invalid_value", "有効なコースタイプを選択してください: walking, cycling, jogging", request.Request.CourseType)
	}

	if request.Request.Distance == "" {
		return utils.NewValidationError("距離が必要です").
			WithDetail("distance", "required", "距離を選択してください", nil)
	}

	validDistances := []string{"short", "medium", "long"}
	isValidDistance := false
	for _, validDistance := range validDistances {
		if request.Request.Distance == validDistance {
			isValidDistance = true
			break
		}
	}
	if !isValidDistance {
		return utils.NewValidationError("無効な距離です").
			WithDetail("distance", "invalid_value", "有効な距離を選択してください: short, medium, long", request.Request.Distance)
	}

	// Validate location if provided
	if request.Request.Location != nil {
		if request.Request.Location.Latitude < -90 || request.Request.Location.Latitude > 90 {
			return utils.NewValidationError("無効な緯度です").
				WithDetail("location.latitude", "invalid_range", "緯度は-90から90の間である必要があります", request.Request.Location.Latitude)
		}
		if request.Request.Location.Longitude < -180 || request.Request.Location.Longitude > 180 {
			return utils.NewValidationError("無効な経度です").
				WithDetail("location.longitude", "invalid_range", "経度は-180から180の間である必要があります", request.Request.Location.Longitude)
		}
	}

	// Validate preferences if provided
	if request.Request.Preferences != nil {
		if request.Request.Preferences.Scenery != nil {
			validSceneries := []string{"nature", "urban", "mixed"}
			isValidScenery := false
			for _, validScenery := range validSceneries {
				if *request.Request.Preferences.Scenery == validScenery {
					isValidScenery = true
					break
				}
			}
			if !isValidScenery {
				return utils.NewValidationError("無効な景観タイプです").
					WithDetail("preferences.scenery", "invalid_value", "有効な景観タイプを選択してください: nature, urban, mixed", *request.Request.Preferences.Scenery)
			}
		}

		if request.Request.Preferences.Difficulty != nil {
			validDifficulties := []string{"easy", "moderate", "hard"}
			isValidDifficulty := false
			for _, validDifficulty := range validDifficulties {
				if *request.Request.Preferences.Difficulty == validDifficulty {
					isValidDifficulty = true
					break
				}
			}
			if !isValidDifficulty {
				return utils.NewValidationError("無効な難易度です").
					WithDetail("preferences.difficulty", "invalid_value", "有効な難易度を選択してください: easy, moderate, hard", *request.Request.Preferences.Difficulty)
			}
		}
	}

	return nil
}

// validateDetailsRequest performs additional validation for details request
func (h *CourseHandler) validateDetailsRequest(request *shared.DetailsRequest) *utils.AppError {
	if request.Suggestion.ID == "" {
		return utils.NewValidationError("コースIDが必要です").
			WithDetail("suggestion.id", "required", "コースIDを指定してください", nil)
	}

	if request.Suggestion.Title == "" {
		return utils.NewValidationError("コースタイトルが必要です").
			WithDetail("suggestion.title", "required", "コースタイトルを指定してください", nil)
	}

	if request.Suggestion.CourseType == "" {
		return utils.NewValidationError("コースタイプが必要です").
			WithDetail("suggestion.courseType", "required", "コースタイプを指定してください", nil)
	}

	// Validate start point
	if request.Suggestion.StartPoint.Latitude < -90 || request.Suggestion.StartPoint.Latitude > 90 {
		return utils.NewValidationError("無効な開始地点の緯度です").
			WithDetail("suggestion.startPoint.latitude", "invalid_range", "緯度は-90から90の間である必要があります", request.Suggestion.StartPoint.Latitude)
	}
	if request.Suggestion.StartPoint.Longitude < -180 || request.Suggestion.StartPoint.Longitude > 180 {
		return utils.NewValidationError("無効な開始地点の経度です").
			WithDetail("suggestion.startPoint.longitude", "invalid_range", "経度は-180から180の間である必要があります", request.Suggestion.StartPoint.Longitude)
	}

	return nil
}
