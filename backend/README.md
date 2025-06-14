# Potarin Backend

Go-based backend API for the Potarin V2 walking/cycling route suggestion application.

## Tech Stack
- Go 1.21+
- Fiber v2 (web framework)
- OpenAI GPT-4 API integration (planned)

## Setup

1. Install dependencies:
```bash
go mod tidy
```

2. Run the server:
```bash
go run main.go
```

The server will start on `http://localhost:8080`

## API Endpoints

### Health Check
- `GET /api/v1/health` - Returns server status

### Course Suggestions (Planned)
- `POST /api/v1/suggestions` - Get AI-powered course suggestions
- Input: User preferences (weather, course type, etc.)
- Output: Array of suggested courses

### Course Details (Planned)
- `POST /api/v1/details` - Get detailed course information
- Input: Selected course summary
- Output: Detailed course with waypoints and position data

## Development

The backend follows these principles:
- Type-safe JSON schema validation
- Structured OpenAI API integration
- Robust error handling without panics
- Lightweight REST API design