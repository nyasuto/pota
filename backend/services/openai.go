package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/sashabaranov/go-openai"
	"github.com/sashabaranov/go-openai/jsonschema"
)

type OpenAIService struct {
	client *openai.Client
}

func NewOpenAIService(apiKey string) *OpenAIService {
	return &OpenAIService{
		client: openai.NewClient(apiKey),
	}
}

// LocationInfo represents area information based on coordinates
type LocationInfo struct {
	Area         string // e.g., "東京", "神奈川", "大阪"
	Prefecture   string // e.g., "東京都", "神奈川県", "大阪府"
	Description  string // e.g., "東京都内", "神奈川県内", "大阪府内"
	AreaType     string // e.g., "都内", "県内", "府内"
}

// getLocationInfo determines the area based on coordinates
func getLocationInfo(lat, lng float64) LocationInfo {
	// Tokyo (東京都)
	if lat >= 35.5 && lat <= 35.9 && lng >= 139.3 && lng <= 139.9 {
		return LocationInfo{
			Area:         "東京",
			Prefecture:   "東京都",
			Description:  "東京都内または近郊",
			AreaType:     "都内",
		}
	}
	
	// Kanagawa (神奈川県) - including Fujisawa/Shonan area
	if lat >= 35.1 && lat <= 35.7 && lng >= 139.0 && lng <= 139.8 {
		return LocationInfo{
			Area:         "神奈川",
			Prefecture:   "神奈川県",
			Description:  "神奈川県内",
			AreaType:     "県内",
		}
	}
	
	// Osaka (大阪府)
	if lat >= 34.3 && lat <= 34.8 && lng >= 135.2 && lng <= 135.8 {
		return LocationInfo{
			Area:         "大阪",
			Prefecture:   "大阪府",
			Description:  "大阪府内",
			AreaType:     "府内",
		}
	}
	
	// Kyoto (京都府)
	if lat >= 34.8 && lat <= 35.8 && lng >= 135.4 && lng <= 136.0 {
		return LocationInfo{
			Area:         "京都",
			Prefecture:   "京都府",
			Description:  "京都府内",
			AreaType:     "府内",
		}
	}
	
	// Default to general Japan area
	return LocationInfo{
		Area:         "日本",
		Prefecture:   "日本",
		Description:  "指定された地域",
		AreaType:     "地域内",
	}
}

// CourseSuggestionPrompt generates a prompt for course suggestions
func (s *OpenAIService) GenerateCourseSuggestions(ctx context.Context, request CourseRequest) (*CourseSuggestionsResponse, error) {
	prompt := s.buildSuggestionPrompt(request)
	systemPrompt := s.buildSystemPrompt(request)
	schema := s.getCourseSuggestionsSchema()

	resp, err := s.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: openai.GPT4o,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: systemPrompt,
			},
			{
				Role:    openai.ChatMessageRoleUser,
				Content: prompt,
			},
		},
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type: openai.ChatCompletionResponseFormatTypeJSONSchema,
			JSONSchema: &openai.ChatCompletionResponseFormatJSONSchema{
				Name:   "course_suggestions",
				Schema: &schema,
				Strict: true,
			},
		},
		Temperature: 0.7,
		MaxTokens:   2000,
	})

	if err != nil {
		return nil, fmt.Errorf("OpenAI API error: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	var result CourseSuggestionsResponse
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result); err != nil {
		log.Printf("Failed to parse OpenAI response: %s", resp.Choices[0].Message.Content)
		return nil, fmt.Errorf("failed to parse OpenAI response: %w", err)
	}

	return &result, nil
}

// GenerateCourseDetails generates detailed course information with waypoints
func (s *OpenAIService) GenerateCourseDetails(ctx context.Context, suggestion CourseSuggestion) (*CourseDetailsResponse, error) {
	prompt := s.buildDetailsPrompt(suggestion)
	systemPrompt := s.buildDetailsSystemPrompt(suggestion)
	schema := s.getCourseDetailsSchema()

	resp, err := s.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: openai.GPT4o,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleSystem,
				Content: systemPrompt,
			},
			{
				Role:    openai.ChatMessageRoleUser,
				Content: prompt,
			},
		},
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type: openai.ChatCompletionResponseFormatTypeJSONSchema,
			JSONSchema: &openai.ChatCompletionResponseFormatJSONSchema{
				Name:   "course_details",
				Schema: &schema,
				Strict: true,
			},
		},
		Temperature: 0.5,
		MaxTokens:   3000,
	})

	if err != nil {
		return nil, fmt.Errorf("OpenAI API error: %w", err)
	}

	if len(resp.Choices) == 0 {
		return nil, fmt.Errorf("no response from OpenAI")
	}

	var result CourseDetailsResponse
	if err := json.Unmarshal([]byte(resp.Choices[0].Message.Content), &result); err != nil {
		log.Printf("Failed to parse OpenAI response: %s", resp.Choices[0].Message.Content)
		return nil, fmt.Errorf("failed to parse OpenAI response: %w", err)
	}

	return &result, nil
}

// buildSystemPrompt creates a dynamic system prompt based on user location
func (s *OpenAIService) buildSystemPrompt(request CourseRequest) string {
	var locationInfo LocationInfo
	if request.Location != nil {
		locationInfo = getLocationInfo(request.Location.Latitude, request.Location.Longitude)
	} else {
		// Default to Tokyo if no location provided
		locationInfo = LocationInfo{
			Area:         "東京",
			Prefecture:   "東京都",
			Description:  "東京都内または近郊",
			AreaType:     "都内",
		}
	}
	
	return fmt.Sprintf("あなたは%sエリアの地域ガイド専門家です。ユーザーの希望に基づいて最適な散歩、サイクリング、ジョギングコースを提案してください。回答は必ず日本語で行い、提供されたJSONスキーマに厳密に従ってください。すべてのテキストフィールド（title, description, highlights, summary等）は日本語で記述してください。", locationInfo.Area)
}

// buildDetailsSystemPrompt creates a dynamic system prompt for course details
func (s *OpenAIService) buildDetailsSystemPrompt(suggestion CourseSuggestion) string {
	// Determine area from start point coordinates
	locationInfo := getLocationInfo(suggestion.StartPoint.Latitude, suggestion.StartPoint.Longitude)
	
	return fmt.Sprintf("あなたは%sエリアのルート設計専門家です。具体的なウェイポイントとランドマークを含む詳細なコース情報を作成してください。回答は必ず日本語で行い、提供されたJSONスキーマに厳密に従ってください。すべてのテキストフィールド（title, description等）は日本語で記述してください。", locationInfo.Area)
}

func (s *OpenAIService) buildSuggestionPrompt(request CourseRequest) string {
	distanceText := map[string]string{
		"short":  "1-3km",
		"medium": "3-10km",
		"long":   "10km以上",
	}

	var locationInfo LocationInfo
	if request.Location != nil {
		locationInfo = getLocationInfo(request.Location.Latitude, request.Location.Longitude)
	} else {
		// Default to Tokyo if no location provided
		locationInfo = LocationInfo{
			Area:         "東京",
			Prefecture:   "東京都",
			Description:  "東京都内または近郊",
			AreaType:     "都内",
		}
	}

	prompt := fmt.Sprintf(`%s周辺で%sの%sコースを3つ提案してください。

要求詳細:
- コースタイプ: %s
- 希望距離: %s
- 場所: %s`,
		locationInfo.Area,
		distanceText[request.Distance],
		request.CourseType,
		request.CourseType,
		distanceText[request.Distance],
		locationInfo.Description)

	if request.Location != nil {
		prompt += fmt.Sprintf("\n- 現在地周辺: 緯度%f, 経度%f", request.Location.Latitude, request.Location.Longitude)
	}

	if request.Preferences != nil {
		if request.Preferences.Scenery != nil {
			sceneryText := map[string]string{
				"nature": "自然豊か",
				"urban":  "都市部",
				"mixed":  "自然と都市の混合",
			}
			prompt += fmt.Sprintf("\n- 景観の希望: %s", sceneryText[*request.Preferences.Scenery])
		}
		if request.Preferences.Difficulty != nil {
			difficultyText := map[string]string{
				"easy":     "初心者向け（平坦）",
				"moderate": "中級者向け（適度な起伏）",
				"hard":     "上級者向け（坂道多め）",
			}
			prompt += fmt.Sprintf("\n- 難易度: %s", difficultyText[*request.Preferences.Difficulty])
		}
		if request.Preferences.AvoidHills != nil && *request.Preferences.AvoidHills {
			prompt += "\n- 坂道を避ける"
		}
	}

	prompt += `

各コースには以下を含めてください:
- 魅力的なタイトル（日本語）
- コースの特徴と見どころの説明（日本語）
- 正確な距離（km）
- 推定所要時間（分）
- 難易度レベル
- 出発地点の緯度経度
- ハイライト（見どころ）リスト（日本語）
- コースの概要（日本語）

実在する%sの場所を基にして、具体的で実用的なコースを提案してください。
**重要**: すべてのテキスト内容は必ず日本語で記述してください。英語は使用しないでください。`, locationInfo.Prefecture)

	return prompt
}

func (s *OpenAIService) buildDetailsPrompt(suggestion CourseSuggestion) string {
	// Determine area from start point coordinates
	locationInfo := getLocationInfo(suggestion.StartPoint.Latitude, suggestion.StartPoint.Longitude)
	
	return fmt.Sprintf(`以下のコース「%s」について、詳細な情報を生成してください:

%s

以下の詳細情報を含めてください:
- 具体的なwaypoint（スタート地点、チェックポイント、ランドマーク、ゴール地点）
- 各waypointの緯度経度座標
- waypoint間の説明（日本語）
- コース全体の詳細な説明（日本語）
- 高低差情報（あれば）

実在する%sの場所を基にして、実際に歩ける/走れる/自転車で移動できるルートを設計してください。
各waypointには分かりやすいタイトルと説明を付けてください。
**重要**: すべてのテキスト内容（title, description等）は必ず日本語で記述してください。英語は使用しないでください。`,
		suggestion.Title,
		suggestion.Description,
		locationInfo.Prefecture)
}

func (s *OpenAIService) getCourseSuggestionsSchema() jsonschema.Definition {
	return jsonschema.Definition{
		Type:                 jsonschema.Object,
		AdditionalProperties: false,
		Properties: map[string]jsonschema.Definition{
			"suggestions": {
				Type: jsonschema.Array,
				Items: &jsonschema.Definition{
					Type:                 jsonschema.Object,
					AdditionalProperties: false,
					Properties: map[string]jsonschema.Definition{
						"id": {
							Type: jsonschema.String,
						},
						"title": {
							Type: jsonschema.String,
						},
						"description": {
							Type: jsonschema.String,
						},
						"distance": {
							Type: jsonschema.Number,
						},
						"estimatedTime": {
							Type: jsonschema.Integer,
						},
						"difficulty": {
							Type: jsonschema.String,
							Enum: []string{"easy", "moderate", "hard"},
						},
						"courseType": {
							Type: jsonschema.String,
							Enum: []string{"walking", "cycling", "jogging"},
						},
						"startPoint": {
							Type:                 jsonschema.Object,
							AdditionalProperties: false,
							Properties: map[string]jsonschema.Definition{
								"latitude": {
									Type: jsonschema.Number,
								},
								"longitude": {
									Type: jsonschema.Number,
								},
							},
							Required: []string{"latitude", "longitude"},
						},
						"highlights": {
							Type: jsonschema.Array,
							Items: &jsonschema.Definition{
								Type: jsonschema.String,
							},
						},
						"summary": {
							Type: jsonschema.String,
						},
					},
					Required: []string{"id", "title", "description", "distance", "estimatedTime", "difficulty", "courseType", "startPoint", "highlights", "summary"},
				},
			},
		},
		Required: []string{"suggestions"},
	}
}

func (s *OpenAIService) getCourseDetailsSchema() jsonschema.Definition {
	return jsonschema.Definition{
		Type:                 jsonschema.Object,
		AdditionalProperties: false,
		Properties: map[string]jsonschema.Definition{
			"course": {
				Type:                 jsonschema.Object,
				AdditionalProperties: false,
				Properties: map[string]jsonschema.Definition{
					"id": {
						Type: jsonschema.String,
					},
					"title": {
						Type: jsonschema.String,
					},
					"description": {
						Type: jsonschema.String,
					},
					"distance": {
						Type: jsonschema.Number,
					},
					"estimatedTime": {
						Type: jsonschema.Integer,
					},
					"difficulty": {
						Type: jsonschema.String,
						Enum: []string{"easy", "moderate", "hard"},
					},
					"courseType": {
						Type: jsonschema.String,
						Enum: []string{"walking", "cycling", "jogging"},
					},
					"waypoints": {
						Type: jsonschema.Array,
						Items: &jsonschema.Definition{
							Type:                 jsonschema.Object,
							AdditionalProperties: false,
							Properties: map[string]jsonschema.Definition{
								"id": {
									Type: jsonschema.String,
								},
								"title": {
									Type: jsonschema.String,
								},
								"description": {
									Type: jsonschema.String,
								},
								"position": {
									Type:                 jsonschema.Object,
									AdditionalProperties: false,
									Properties: map[string]jsonschema.Definition{
										"latitude": {
											Type: jsonschema.Number,
										},
										"longitude": {
											Type: jsonschema.Number,
										},
									},
									Required: []string{"latitude", "longitude"},
								},
								"type": {
									Type: jsonschema.String,
									Enum: []string{"start", "checkpoint", "landmark", "end"},
								},
							},
							Required: []string{"id", "title", "description", "position", "type"},
						},
					},
				},
				Required: []string{"id", "title", "description", "distance", "estimatedTime", "difficulty", "courseType", "waypoints"},
			},
		},
		Required: []string{"course"},
	}
}
