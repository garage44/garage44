# ADR-001: Monorepo Structure with Package Separation

## Status
Accepted

## Date
2025-04-17 (from commit `ec0185b`)

## Context

Expressio combines multiple concerns:
- Core i18n application with commercial considerations
- Development tooling for hot reload and bundling
- Shared utilities for common functionality
- Translation service abstraction layer

A decision was needed on how to structure the codebase to:
- Separate commercial/open-source concerns
- Enable code reuse across components
- Maintain clear boundaries between different domains
- Support independent versioning and publishing

## Decision

Implement a monorepo structure with four distinct packages:

- **`expressio/`** - Main application (AGPL licensed)
  - Frontend Preact components
  - Backend API routes
  - Core business logic
  - CLI entry point

- **`bunchy/`** - Development tooling (MIT licensed)
  - Hot reload functionality
  - Build task automation
  - Development server utilities

- **`common/`** - Shared utilities (MIT licensed)
  - UI components
  - WebSocket client/server
  - State management
  - Validation utilities

- **`enola/`** - Translation service wrapper (MIT licensed)
  - Translation provider abstractions
  - Language code mappings
  - Translation engine implementations

## Consequences

### Positive
- Clear separation of concerns by business domain
- Enables mixed licensing strategy (commercial protection + community building)
- Shared utilities can be reused across packages
- Independent publishing and versioning possible
- Easier to reason about dependencies and boundaries

### Negative
- More complex build and dependency management
- Requires discipline to maintain package boundaries
- Potential for circular dependencies if not careful
- More overhead in project setup and configuration

## Implementation Notes
- Uses Bun workspaces for dependency management
- Path aliases configured in TypeScript for clean imports
- Each package maintains its own `package.json` and build configuration