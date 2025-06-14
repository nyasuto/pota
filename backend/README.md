# Potarin Backend

Go-based backend API for the Potarin V2 walking/cycling route suggestion application.

## Tech Stack
- Go 1.21+
- Fiber v2 (web framework)
- OpenAI GPT-4 API integration
- JSON Schema for structured AI responses

## Setup

1. Install dependencies:
```bash
go mod tidy
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

3. Run the server:
```bash
go run main.go
```

The server will start on `http://localhost:8080`

## API Endpoints

### Health Check
- `GET /api/v1/health` - Returns server status

### Course Suggestions
- `POST /api/v1/suggestions` - Get AI-powered course suggestions
- Input: User preferences (weather, course type, location, etc.)
- Output: Array of suggested courses with details

### Course Details
- `POST /api/v1/details` - Get detailed course information
- Input: Selected course summary
- Output: Detailed course with waypoints and position data

## Environment Variables

Required:
- `OPENAI_API_KEY` - Your OpenAI API key

Optional:
- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (default: development)

## Architecture

### Key Components

#### Config (`config/`)
- Environment variable management
- Configuration validation

#### Services (`services/`)
- `OpenAIService` - GPT-4 integration with JSON Schema
- Structured prompts for course generation
- Type-safe AI response handling

#### Handlers (`handlers/`)
- HTTP request/response handling
- Input validation using shared types
- Error handling and status codes

### AI Integration

The backend uses OpenAI GPT-4 with JSON Schema to ensure structured, type-safe responses:

- **Suggestions**: Generates 3 course options based on user preferences
- **Details**: Creates detailed waypoint information for selected courses
- **Prompts**: Optimized for Tokyo/Japan-specific route suggestions
- **Validation**: Responses are validated against shared type definitions

## Development

The backend follows these principles:
- Type-safe JSON schema validation
- Structured OpenAI API integration with JSON Schema mode
- Robust error handling without panics
- Lightweight REST API design
- Shared types with frontend for consistency