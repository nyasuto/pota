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

TBD

**Current Status**: early state

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

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push -u origin feat/new-feature
gh pr create
```

**This rule prevents accidental commits to main and maintains clean git history.**

## Technology Stack

TBD

## Development Setup

TBD

### Environment Configuration

TBD

## Architecture

TBD

### Key Components

TBD

## Key Implementation Notes

TBD

## Dependencies

TBD

## Development Tools & CI/CD

The project includes:

- **GitHub Actions**: CI/CD pipeline with testing, linting, formatting, and security checks
- **Code Quality**: TBD
- **Security**: TBD
- **Dependabot**: Automated dependency updates

## Testing & Quality

TBD

## Development Guidelines

TBD

### Code Style

TBD

## Contributing

When contributing to this project:

1. Run all quality checks before submitting PR
2. Update documentation for new features
3. Test on clean macOS environment
4. Follow the established code style

## Git Workflow for Claude Code

### Commit Safety Checklist

Before any commit operation, Claude Code must:

✅ Check current branch: `git status`  
✅ If on main: Create feature branch first  
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
