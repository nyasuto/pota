package shared

import "time"

// Position represents a geographic coordinate
type Position struct {
	Latitude  float64 `json:"latitude" validate:"min=-90,max=90"`
	Longitude float64 `json:"longitude" validate:"min=-180,max=180"`
}

// CourseRequest represents the user's course request
type CourseRequest struct {
	CourseType  string            `json:"courseType" validate:"required,oneof=walking cycling jogging"`
	Distance    string            `json:"distance" validate:"required,oneof=short medium long"`
	Location    *Position         `json:"location,omitempty"`
	Preferences *CoursePreferences `json:"preferences,omitempty"`
}

// CoursePreferences represents optional user preferences
type CoursePreferences struct {
	Scenery    *string `json:"scenery,omitempty" validate:"omitempty,oneof=nature urban mixed"`
	Difficulty *string `json:"difficulty,omitempty" validate:"omitempty,oneof=easy moderate hard"`
	AvoidHills *bool   `json:"avoidHills,omitempty"`
}

// Waypoint represents a point of interest along the route
type Waypoint struct {
	ID          string   `json:"id" validate:"required"`
	Title       string   `json:"title" validate:"required"`
	Description string   `json:"description" validate:"required"`
	Position    Position `json:"position" validate:"required"`
	Type        string   `json:"type" validate:"required,oneof=start checkpoint landmark end"`
}

// CourseSuggestion represents a suggested course
type CourseSuggestion struct {
	ID            string   `json:"id" validate:"required"`
	Title         string   `json:"title" validate:"required"`
	Description   string   `json:"description" validate:"required"`
	Distance      float64  `json:"distance" validate:"min=0"`
	EstimatedTime int      `json:"estimatedTime" validate:"min=0"`
	Difficulty    string   `json:"difficulty" validate:"required,oneof=easy moderate hard"`
	CourseType    string   `json:"courseType" validate:"required,oneof=walking cycling jogging"`
	StartPoint    Position `json:"startPoint" validate:"required"`
	Highlights    []string `json:"highlights" validate:"required"`
	Summary       string   `json:"summary" validate:"required"`
}

// ElevationProfile represents elevation data for a course
type ElevationProfile struct {
	Distance  float64 `json:"distance"`
	Elevation float64 `json:"elevation"`
}

// Elevation represents elevation information for a course
type Elevation struct {
	Gain    float64            `json:"gain"`
	Profile []ElevationProfile `json:"profile"`
}

// CourseDetails represents detailed course information
type CourseDetails struct {
	ID            string      `json:"id" validate:"required"`
	Title         string      `json:"title" validate:"required"`
	Description   string      `json:"description" validate:"required"`
	Distance      float64     `json:"distance" validate:"min=0"`
	EstimatedTime int         `json:"estimatedTime" validate:"min=0"`
	Difficulty    string      `json:"difficulty" validate:"required,oneof=easy moderate hard"`
	CourseType    string      `json:"courseType" validate:"required,oneof=walking cycling jogging"`
	Waypoints     []Waypoint  `json:"waypoints" validate:"required"`
	Polyline      *string     `json:"polyline,omitempty"`
	Elevation     *Elevation  `json:"elevation,omitempty"`
}

// API Request/Response types

// SuggestionsRequest represents a request for course suggestions
type SuggestionsRequest struct {
	Request CourseRequest `json:"request" validate:"required"`
}

// SuggestionsResponse represents the response with course suggestions
type SuggestionsResponse struct {
	Suggestions []CourseSuggestion `json:"suggestions" validate:"required"`
	RequestID   string             `json:"requestId" validate:"required"`
	GeneratedAt time.Time          `json:"generatedAt" validate:"required"`
}

// DetailsRequest represents a request for course details
type DetailsRequest struct {
	CourseID   string           `json:"courseId" validate:"required"`
	Suggestion CourseSuggestion `json:"suggestion" validate:"required"`
}

// DetailsResponse represents the response with course details
type DetailsResponse struct {
	Course      CourseDetails `json:"course" validate:"required"`
	RequestID   string        `json:"requestId" validate:"required"`
	GeneratedAt time.Time     `json:"generatedAt" validate:"required"`
}

// ApiError represents an API error response
type ApiError struct {
	Error   string      `json:"error" validate:"required"`
	Message string      `json:"message" validate:"required"`
	Code    *string     `json:"code,omitempty"`
	Details interface{} `json:"details,omitempty"`
}

// HealthResponse represents a health check response
type HealthResponse struct {
	Status    string     `json:"status" validate:"required,oneof=ok error"`
	Message   string     `json:"message" validate:"required"`
	Timestamp *time.Time `json:"timestamp,omitempty"`
}