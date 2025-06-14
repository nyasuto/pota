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

**Current Status**: Core infrastructure complete - Ready for API implementation phase

## 🎯 Project Progress (Updated: 2025-01-14)

### ✅ Completed (Phase 1: Foundation)
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + React 19
- **Backend**: Go + Fiber v2 web framework  
- **Shared Types**: Cross-platform type definitions (TS/Go) + JSON Schema
- **CI/CD**: GitHub Actions (frontend/backend/security testing)
- **Dependencies**: Dependabot with auto-merge configuration
- **OpenAI Integration**: GPT-4 service with JSON Schema structured responses
- **Architecture**: Clean layered architecture with type safety

### 🚧 Current Phase: API Implementation
- OpenAI GPT-4 integration with structured prompts ✅
- Environment configuration and validation ✅  
- Service layer architecture ✅
- Ready to implement API endpoints

### 📋 Next Steps (Phase 2: Core Features)
1. **API Endpoints**: Implement suggestions and details endpoints
2. **Frontend Integration**: Connect UI to backend APIs
3. **Error Handling**: Comprehensive error states and validation
4. **Map Integration**: React-Leaflet for route visualization

## ⚠️ CRITICAL: Branch Protection Rules

**NEVER COMMIT DIRECTLY TO MAIN BRANCH**

### Mandatory Workflow for All Commits

1. **Before ANY commit**: Check current branch with `git branch` or `git status`
2. **If on main branch**: ALWAYS create a new feature branch first
3. **Only commit to feature branches**: Never commit directly to main
4. **Use Pull Requests**: All changes to main must go through PR review

### Commit Command Behavior

When user says "commit" or requests a commit:

1. **Check current branch first**: `git branch` or `git status`
2. **If on main branch**:
   - Automatically create new feature branch with descriptive name
   - Switch to the new branch
   - Then perform the commit
3. **If on feature branch**: Proceed with commit normally
4. **For Go code changes**: ALWAYS run `go fmt ./...` before commit

### Branch Naming Convention

Use descriptive branch names with prefixes:

- `feat/`: New features (`feat/add-hotkey-support`)
- `fix/`: Bug fixes (`fix/audio-processing-error`)
- `docs/`: Documentation updates (`docs/update-readme`)
- `refactor/`: Code refactoring (`refactor/speech-providers`)
- `test/`: Test additions (`test/add-unit-tests`)

### Example Safe Commit Flow

```bash
# Check current branch
git status

# If on main, create feature branch
git checkout -b feat/new-feature

# Format Go code before commit
go fmt ./...

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push -u origin feat/new-feature
gh pr create
```

**This rule prevents accidental commits to main and maintains clean git history.**

## Technology Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React 18** with modern hooks
- **Bun** as package manager
- **React-Leaflet** for map visualization (planned)

### Backend
- **Go 1.21+** with Fiber v2 framework
- **OpenAI GPT-4** API integration (planned)
- **JSON Schema** validation for AI responses
- **CORS** enabled for frontend communication

### Shared
- **TypeScript types** for frontend
- **Go structs** with validation tags
- **JSON Schema** definitions for AI integration
- **API constants** and endpoint definitions

### Development Tools
- **Git** with feature branch workflow
- **GitHub** for repository management
- **Bun** for frontend package management
- **Go modules** for backend dependencies

## Development Setup

### Prerequisites
- **Go 1.21+** for backend development
- **Bun** for frontend package management
- **Git** for version control

### Quick Start

1. **Backend Setup**:
   ```bash
   cd backend
   go mod tidy
   go run main.go  # Starts on :8080
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   bun install
   bun dev  # Starts on :3000
   ```

3. **Shared Types**:
   ```bash
   cd shared
   go mod tidy  # For Go validation
   ```

### Environment Configuration

#### Backend (.env)
```
OPENAI_API_KEY=your_api_key_here
PORT=8080
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Architecture

### Directory Structure
```
/
├── frontend/          # Next.js 14 + TypeScript frontend
│   ├── app/          # App Router pages and components
│   ├── components/   # Reusable React components (planned)
│   └── package.json  # Frontend dependencies
├── backend/          # Go + Fiber API server
│   ├── main.go      # Main application entry point
│   └── go.mod       # Go dependencies
└── shared/          # Shared types and schemas
    ├── types.ts     # TypeScript definitions
    ├── types.go     # Go struct definitions
    ├── schemas.json # JSON Schema for AI
    └── api-constants.ts # API endpoints and constants
```

### Key Components

#### Frontend (Next.js)
- **App Router**: Modern Next.js routing with layouts
- **TypeScript**: Full type safety with shared types
- **Tailwind CSS**: Utility-first styling
- **API Integration**: Type-safe backend communication

#### Backend (Go + Fiber)
- **REST API**: JSON-based endpoints for course suggestions
- **Type Safety**: Struct validation with tags
- **AI Integration**: OpenAI GPT-4 with JSON Schema (planned)
- **CORS**: Cross-origin support for frontend

#### Shared Types
- **Cross-platform**: Same data structures for Go and TypeScript
- **Validation**: Go struct tags for request validation
- **AI Schema**: JSON Schema for OpenAI response formatting

## Key Implementation Notes

### API Endpoints
- **GET /api/v1/health**: Health check endpoint
- **POST /api/v1/suggestions**: Get AI-powered course suggestions
- **POST /api/v1/details**: Get detailed course information with waypoints

### Type Safety Strategy
1. **Shared Types**: Same data structures across frontend/backend
2. **Go Validation**: Struct tags validate incoming requests
3. **TypeScript**: Compile-time type checking for frontend
4. **JSON Schema**: Runtime validation and AI response formatting

### AI Integration Pattern
- Use JSON Schema to constrain GPT responses
- Validate responses against Go structs  
- Type-safe data flow from AI → Backend → Frontend
- **Implemented**: OpenAI GPT-4 service with structured prompts
- **Features**: Tokyo-specific route suggestions, waypoint generation

### Development Workflow  
1. Define types in `/shared` first ✅
2. Implement backend endpoints with validation 🚧 (In Progress)
3. Create frontend components with type safety ⏳
4. **Verify frontend builds**: Run `bun run build` to ensure frontend compiles
5. Test integration between all layers ⏳

### Current Technical Achievements
- **OpenAI SDK**: Integrated sashabaranov/go-openai v1.40.1
- **JSON Schema**: Strict mode for structured AI responses
- **Environment**: Secure API key management with validation
- **Prompts**: Optimized for Japanese route planning
- **Architecture**: Services → Handlers → Routes pattern
- **Module System**: Local shared types module integration

## Dependencies

### Frontend
- **Next.js 14.2.16**: React framework with App Router
- **React 18**: Core React library
- **TypeScript 5**: Type safety and tooling
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **Autoprefixer**: CSS vendor prefixes

### Backend
- **Fiber v2**: Fast Go web framework
- **Go 1.21+**: Programming language
- **validator**: Request validation library (planned)

### Shared
- **Go modules**: Dependency management
- **TypeScript**: Type definitions
- **JSON Schema**: Validation and AI integration

### Development
- **Bun**: Fast JavaScript runtime and package manager
- **ESLint**: Code linting for frontend
- **Git**: Version control with feature branches

## Development Tools & CI/CD

### Current Tools
- **Git**: Feature branch workflow with PR review
- **GitHub**: Repository hosting and collaboration
- **Bun**: Fast package manager for frontend
- **Go modules**: Dependency management for backend
- **TypeScript**: Compile-time type checking

### Planned CI/CD
- **GitHub Actions**: Automated testing and deployment
- **Code Quality**: ESLint, Go vet, and formatting
- **Security**: Dependency scanning and security checks
- **Dependabot**: Automated dependency updates

## Testing & Quality

### Current Status
- **Type Safety**: TypeScript + Go struct validation
- **Manual Testing**: Health endpoint verification
- **Code Structure**: Clean separation of concerns

### Planned Testing
- **Frontend**: Jest + React Testing Library
- **Backend**: Go testing package with API tests
- **Integration**: End-to-end API testing
- **Validation**: JSON Schema compliance testing

## Development Guidelines

### General Principles
1. **Type Safety First**: Use shared types across all layers
2. **API Contract**: Define schemas before implementation
3. **Feature Branches**: Never commit directly to main
4. **Clean Architecture**: Separate concerns between layers
5. **Documentation**: Update README and CLAUDE.md for changes

### Code Style

#### Frontend (TypeScript/React)
- Use TypeScript strict mode
- Import shared types from `/shared`
- Follow Next.js App Router conventions
- Use Tailwind CSS utility classes
- Prefer functional components with hooks

#### Backend (Go)
- Use Go standard formatting (`go fmt`)
- Validate requests with struct tags
- Handle errors gracefully without panics
- Use Fiber v2 conventions for handlers
- Import shared types from `potarin-shared`

#### Shared Types
- Define types in both TypeScript and Go
- Keep JSON Schema in sync with types
- Use clear, descriptive naming
- Add validation tags to Go structs

## Contributing

When contributing to this project:

1. **Verify frontend builds**: Run `bun run build` to ensure code changes don't break compilation
2. Run all quality checks before submitting PR
3. Update documentation for new features
4. Test on clean macOS environment
5. Follow the established code style

## Git Workflow for Claude Code

### Commit Safety Checklist

Before any commit operation, Claude Code must:

✅ Check current branch: `git status`  
✅ If on main: Create feature branch first  
✅ Format Go code: `go fmt ./...`  
✅ Use descriptive branch names with prefixes  
✅ Never commit directly to main  
✅ Always use Pull Requests for main branch changes

### Implementation Guidelines

When implementing new features or fixes:

1. **Check branch status first**: Always verify current branch
2. **Create appropriate branch**: Use feat/, fix/, docs/, etc. prefixes
3. **Make focused commits**: Single purpose per commit
4. **Write clear commit messages**: Explain what and why
5. **Create PR for review**: All main branch changes via PR
