# Potarin Shared Types & Schemas

This directory contains shared type definitions and API schemas for the Potarin V2 application, ensuring type safety between the Go backend and TypeScript frontend.

## Files

### `types.ts`
TypeScript type definitions for the frontend, including:
- API request/response interfaces
- Course and waypoint data structures
- Error handling types

### `types.go`
Go struct definitions for the backend, including:
- Validation tags for request validation
- JSON serialization tags
- Complete type safety for API handlers

### `schemas.json`
JSON Schema definitions for:
- API request/response validation
- OpenAI GPT response format specification
- Documentation and testing

### `api-constants.ts`
Frontend constants including:
- API endpoint URLs
- Enum values for course types, distances, etc.
- Configuration values

## Type Safety

The shared types ensure:
1. **Frontend-Backend Consistency**: Same data structures across both systems
2. **API Validation**: Go backend validates requests using struct tags
3. **OpenAI Integration**: JSON schemas guide AI response format
4. **Development Safety**: TypeScript catches type errors at compile time

## Usage

### Frontend (TypeScript)
```typescript
import { CourseSuggestion, SuggestionsRequest } from '@/shared/types';
import { API_ENDPOINTS } from '@/shared/api-constants';
```

### Backend (Go)
```go
import "potarin-shared"

func handleSuggestions(request shared.SuggestionsRequest) shared.SuggestionsResponse {
    // Type-safe API handling
}
```

## Validation

- **Go**: Uses `validator` package with struct tags
- **TypeScript**: Compile-time type checking
- **JSON Schema**: Runtime validation and AI guidance