# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 MANDATORY INSTRUCTIONS FOR CLAUDE CODE

### Primary Rule: NO DIRECT COMMITS TO MAIN

**BEFORE EVERY COMMIT OPERATION:**

1. Run `git status` or `git branch` to check current branch
2. If on `main` branch: STOP and create new feature branch first
3. NEVER run `git commit` while on main branch
4. Always use feature branches for all changes

**This is a HARD REQUIREMENT and must be followed without exception.**

## Project Overview

ポタりん V2 is an AI-powered walking and cycling route suggestion application. The system uses AI agents to propose optimal routes based on user preferences, weather conditions, and location data, with interactive map visualization.

**Current Status**: Full-stack application with AI integration and interactive map visualization

## 🎯 Project Progress (Updated: 2025-06-14)

### ✅ Completed Features
- **Full-stack Architecture**: Next.js 15 + TypeScript + Go + Fiber v2
- **AI Integration**: OpenAI GPT-4o with location-aware prompts and JSON Schema validation
- **Geolocation Services**: Current location, address search, map selection with fallback
- **Interactive Maps**: React-Leaflet integration with waypoint markers and route visualization
- **Type Safety**: Cross-platform types (TypeScript ↔ Go) with shared schemas
- **Real-time UI**: Course search, suggestions display, and detail pages
- **Location Intelligence**: Dynamic prompts based on Tokyo, Kanagawa, Osaka, Kyoto regions

### 🚧 Current Phase: Testing & Quality Assurance
- **CI/CD Setup**: GitHub Actions configuration needed
- **Testing Framework**: Automated test implementation
- **Quality Gates**: Pre-commit validation and build verification

## ⚠️ CRITICAL: Branch Protection & Pre-commit Testing

**NEVER COMMIT DIRECTLY TO MAIN BRANCH**

### Mandatory Pre-commit Testing

**BEFORE EVERY COMMIT, RUN THESE COMMANDS:**

```bash
# 1. Check current branch
git status

# 2. If on main branch, create feature branch first
git checkout -b feat/your-feature-name

# 3. MANDATORY: Run all CI tests locally
cd frontend && bun run build    # Frontend build test
cd ../backend && go fmt ./...   # Go code formatting  
cd ../backend && go build ./... # Backend build test
cd ../backend && go test ./...  # Backend unit tests

# 4. Only commit if all tests pass
git add .
git commit -m "Your commit message"
```

**This ensures every commit meets the same quality standards as CI/CD.**

### Branch Naming Convention

- `feat/`: New features (`feat/add-map-clustering`)
- `fix/`: Bug fixes (`fix/location-detection-error`) 
- `docs/`: Documentation updates (`docs/update-api-guide`)
- `refactor/`: Code refactoring (`refactor/api-client`)
- `test/`: Test additions (`test/add-integration-tests`)

## Technology Stack

### Frontend
- **Next.js 15** with App Router and React 19
- **TypeScript 5** for type safety
- **Tailwind CSS v4** for styling
- **React-Leaflet** for interactive maps
- **Bun** as package manager

### Backend  
- **Go 1.21+** with Fiber v2 framework
- **OpenAI GPT-4o** API with JSON Schema strict mode
- **Location-aware AI prompts** for region-specific route suggestions

### Development Tools
- **Git** with feature branch workflow
- **Bun** for frontend package management
- **Go modules** for backend dependencies

## Development Setup

### Prerequisites
- **Go 1.21+** for backend development
- **Bun** for frontend package management
- **Git** for version control
- **OpenAI API Key** for AI integration

### Quick Start

1. **Backend Setup**:
   ```bash
   cd backend
   go mod tidy
   cp .env.example .env  # Add your OPENAI_API_KEY
   go run main.go        # Starts on :8080
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend  
   bun install
   cp .env.local.example .env.local  # Configure API URL
   bun dev                           # Starts on :3000
   ```

### Environment Configuration

#### Backend (.env)
```bash
OPENAI_API_KEY=your_api_key_here
PORT=8080
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Architecture

### Directory Structure
```
/
├── frontend/          # Next.js 15 + TypeScript frontend
│   ├── app/          # App Router pages and layouts
│   ├── components/   # Reusable React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility libraries (API, geolocation, geocoding)
│   └── package.json  # Frontend dependencies
├── backend/          # Go + Fiber API server
│   ├── handlers/     # HTTP request handlers
│   ├── services/     # Business logic (OpenAI, location)
│   ├── config/       # Application configuration
│   ├── main.go       # Main application entry point
│   └── go.mod        # Go dependencies
└── shared/           # Shared types and schemas
    ├── types.ts      # TypeScript definitions
    ├── types.go      # Go struct definitions
    ├── schemas.json  # JSON Schema for AI validation
    └── api-constants.ts # API endpoints and constants
```

## Key Implementation Features

### API Endpoints
- **GET /api/v1/health**: Health check endpoint
- **POST /api/v1/suggestions**: Location-aware AI course suggestions
- **POST /api/v1/details**: Detailed course with waypoints

### Location Intelligence
- **Dynamic AI Prompts**: Detects user location (Tokyo, Kanagawa, Osaka, Kyoto) and adapts route suggestions
- **Geolocation Services**: Current location, address search, interactive map selection
- **Fallback System**: Defaults to Shonan-dai, Fujisawa when location unavailable

### Map Visualization
- **Interactive Leaflet Maps**: Real-time waypoint markers and route polylines
- **SSR Compatibility**: Dynamic imports for Next.js 15 compatibility
- **Custom Markers**: Color-coded waypoints (start/end/checkpoint/landmark)

### Type Safety Strategy
1. **Shared Types**: Same data structures across frontend/backend
2. **Go Validation**: Struct tags validate incoming requests
3. **TypeScript**: Compile-time type checking
4. **JSON Schema**: Runtime validation for AI responses

## Development Guidelines

### Code Style

#### Frontend (TypeScript/React)
- Use TypeScript strict mode
- Import shared types from `/shared`
- Follow Next.js 15 App Router conventions
- Use Tailwind CSS v4 utility classes
- Prefer functional components with hooks

#### Backend (Go)
- Use Go standard formatting (`go fmt ./...`)
- Validate requests with struct tags  
- Handle errors gracefully without panics
- Use Fiber v2 conventions for handlers
- Import shared types from module

#### Shared Types
- Define types in both TypeScript and Go
- Keep JSON Schema in sync with types
- Use clear, descriptive naming
- Add validation tags to Go structs

## Quality Assurance

### Pre-commit Checklist

Before any commit operation, Claude Code must:

✅ **Check current branch**: `git status`  
✅ **Create feature branch if on main**: `git checkout -b feat/branch-name`  
✅ **Run frontend build**: `cd frontend && bun run build`  
✅ **Format Go code**: `cd backend && go fmt ./...`  
✅ **Test Go build**: `cd backend && go build ./...`  
✅ **Run Go tests**: `cd backend && go test ./...`  
✅ **Use descriptive commit messages**: Explain what and why  
✅ **Create PR for review**: All main branch changes via PR

### Testing Strategy

#### Current Testing
- **Type Safety**: TypeScript + Go struct validation
- **Build Verification**: Frontend/backend compilation checks
- **Manual Testing**: API endpoint and UI functionality verification

#### Planned Testing  
- **GitHub Actions**: Automated CI/CD pipeline
- **Frontend**: Jest + React Testing Library
- **Backend**: Go testing package with API tests
- **Integration**: End-to-end testing with Playwright
- **Quality Gates**: ESLint, Go vet, security scanning

## Contributing Workflow

When implementing new features or fixes:

1. **Check branch status**: Always verify current branch with `git status`
2. **Create feature branch**: Use descriptive names with prefixes (feat/, fix/, docs/, etc.)
3. **Run all pre-commit tests**: Frontend build, Go fmt/build/test
4. **Make focused commits**: Single purpose per commit with clear messages
5. **Create PR for review**: All main branch changes must go through PR process
6. **Update documentation**: Keep CLAUDE.md and README.md current

## 🔧 Technical Insights & Lessons Learned

### AI Prompt Engineering (Issue #42)
**Challenge**: OpenAI prompts were hardcoded to Tokyo, ignoring user location
**Solution**: Dynamic location detection with coordinate-based region mapping
- Added `LocationInfo` struct for area determination
- Implemented `getLocationInfo()` for Tokyo/Kanagawa/Osaka/Kyoto detection  
- Dynamic system prompts: "○○エリアの地域ガイド専門家" based on actual location
- Result: Location-aware route suggestions respecting user coordinates

### Map Integration with Next.js 15
**Challenge**: Leaflet SSR compatibility and container re-initialization errors
**Solution**: Dynamic imports with SSR disabled and proper cleanup
```typescript
const DynamicMap = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => <LoadingSpinner />
});
```

### Branch Protection Enforcement
**Critical Learning**: Always check current branch before any commit operation
- **Prevention**: Make `git status` the first step of any commit workflow
- **Recovery**: Use `git reset --soft HEAD~1` to undo accidental main commits
- **Best Practice**: Create feature branches immediately for all changes

This document ensures consistent development practices and maintains code quality across the full-stack application.