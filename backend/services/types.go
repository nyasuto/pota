package services

import "time"

// Request types for OpenAI service
type CourseRequest struct {
	CourseType  string             `json:"courseType"`
	Distance    string             `json:"distance"`
	Location    *Position          `json:"location,omitempty"`
	Preferences *CoursePreferences `json:"preferences,omitempty"`
}

type Position struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type CoursePreferences struct {
	Scenery    *string `json:"scenery,omitempty"`
	Difficulty *string `json:"difficulty,omitempty"`
	AvoidHills *bool   `json:"avoidHills,omitempty"`
}

// Response types from OpenAI
type CourseSuggestionsResponse struct {
	Suggestions []CourseSuggestion `json:"suggestions"`
}

type CourseSuggestion struct {
	ID            string   `json:"id"`
	Title         string   `json:"title"`
	Description   string   `json:"description"`
	Distance      float64  `json:"distance"`
	EstimatedTime int      `json:"estimatedTime"`
	Difficulty    string   `json:"difficulty"`
	CourseType    string   `json:"courseType"`
	StartPoint    Position `json:"startPoint"`
	Highlights    []string `json:"highlights"`
	Summary       string   `json:"summary"`
}

type CourseDetailsResponse struct {
	Course CourseDetails `json:"course"`
}

type CourseDetails struct {
	ID            string     `json:"id"`
	Title         string     `json:"title"`
	Description   string     `json:"description"`
	Distance      float64    `json:"distance"`
	EstimatedTime int        `json:"estimatedTime"`
	Difficulty    string     `json:"difficulty"`
	CourseType    string     `json:"courseType"`
	Waypoints     []Waypoint `json:"waypoints"`
}

type Waypoint struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Position    Position `json:"position"`
	Type        string   `json:"type"`
}

// Utility functions
func GenerateRequestID() string {
	return time.Now().Format("20060102150405") + "-" + generateRandomString(8)
}

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
