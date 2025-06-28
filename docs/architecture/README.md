# Expressio Architecture Documentation

This directory contains Architecture Decision Records (ADRs) that document the key architectural decisions made during the development of Expressio.

## What are ADRs?

Architecture Decision Records are lightweight documents that capture important architectural decisions along with their context and consequences. They help the team and future developers understand "why we built it this way."

## ADR Format

Each ADR follows this structure:
- **Status**: Proposed/Accepted/Deprecated/Superseded
- **Date**: When the decision was made
- **Context**: The situation that led to this decision
- **Decision**: What was decided
- **Consequences**: Positive and negative outcomes

## Current ADRs

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./ADR-001-monorepo-package-separation.md) | Monorepo Structure with Package Separation | Accepted | 2025-04-17 |
| [ADR-002](./ADR-002-mixed-license-strategy.md) | Mixed License Strategy | Accepted | 2025-04-17 |
| [ADR-003](./ADR-003-bun-runtime-adoption.md) | Bun as Primary Runtime | Accepted | 2025-04-17 |
| [ADR-004](./ADR-004-preact-websocket-architecture.md) | Preact + WebSocket Real-time Architecture | Accepted | 2025-04-17 |
| [ADR-005](./ADR-005-centralized-ci-cd.md) | Centralized CI/CD at Monorepo Root | Accepted | 2025-04-17 |
| [ADR-006](./ADR-006-rest-to-websocket-migration.md) | REST to WebSocket Migration for Workspaces API | Accepted | 2025-06-02 |
| [ADR-007](./ADR-007-bun-serve-migration.md) | Migration to Bun.serve for Development Server | Accepted | 2025-06-02 |
| [ADR-008](./ADR-008-isomorphic-logger.md) | Isomorphic Logger Implementation | Accepted | 2025-06-02 |
| [ADR-009](./ADR-009-llm-optimized-project-structure.md) | LLM-Optimized Project Structure for Strategic Reasoning | Accepted | 2025-01-27 |

## Architectural Principles

Based on these decisions, Expressio follows these core principles:

### 1. **Real-time First**
- Default to WebSocket communication for user-facing features
- Prioritize live updates over request/response patterns
- Build collaboration features with real-time synchronization

### 2. **Package Boundary Discipline**
- Separate packages by business domain, not technical layers
- Respect licensing boundaries (AGPL for core, MIT for utilities)
- Avoid circular dependencies between packages

### 3. **Developer Experience Priority**
- Choose tools that optimize for fast iteration (Bun, TypeScript, hot reload)
- Prefer modern standards over legacy compatibility (ES2023, ES modules)
- Simplify toolchain complexity where possible

### 4. **Commercial/Community Balance**
- Protect core business logic with AGPL
- Enable community growth with MIT utilities
- Build extensible foundations for future commercial features

### 5. **LLM-Optimized Strategic Reasoning**
- Structure documentation to support AI-assisted decision making
- Maintain clear traceability between technical and business decisions
- Centralize strategic context for improved reasoning capabilities
- Enable automated analysis of project evolution and market fit

## Adding New ADRs

When making significant architectural decisions:

1. **Create a new ADR file**: `ADR-XXX-short-title.md`
2. **Follow the standard format** (see existing ADRs as examples)
3. **Link related decisions** in the "Related Decisions" section
4. **Update this README** to include the new ADR in the table
5. **Consider impact on existing principles** and update if needed

## Future Considerations

As Expressio evolves, watch for decisions that might need ADRs:
- New translation provider integrations
- Performance optimization strategies
- Security and authentication approaches
- Scaling and deployment architectures
- API versioning strategies
- Strategic market positioning and community building approaches