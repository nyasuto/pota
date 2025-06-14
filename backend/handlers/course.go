package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"potarin-backend/services"
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
	var request shared.SuggestionsRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(shared.ApiError{
			Error:   "invalid_request",
			Message: "Invalid request body: " + err.Error(),
		})
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

	// Call OpenAI service
	openaiResponse, err := h.openaiService.GenerateCourseSuggestions(c.Context(), serviceRequest)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(shared.ApiError{
			Error:   "ai_generation_error",
			Message: "Failed to generate course suggestions: " + err.Error(),
		})
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

	return c.JSON(response)
}

func (h *CourseHandler) GetDetails(c *fiber.Ctx) error {
	var request shared.DetailsRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(shared.ApiError{
			Error:   "invalid_request",
			Message: "Invalid request body: " + err.Error(),
		})
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

	// Call OpenAI service
	openaiResponse, err := h.openaiService.GenerateCourseDetails(c.Context(), suggestion)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(shared.ApiError{
			Error:   "ai_generation_error",
			Message: "Failed to generate course details: " + err.Error(),
		})
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

	return c.JSON(response)
}
