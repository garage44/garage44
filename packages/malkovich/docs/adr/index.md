# Architecture Decision Records - AI-Optimized Index

**Purpose**: Quick reference for current architectural decisions. Git history provides change tracking.

## Quick Start for AI Assistants

1. **Read [ARCHITECTURE.md](./ARCHITECTURE.md)** - Current system state overview
2. **Search ADRs** by tag, impact area, or decision type below
3. **Apply patterns** from [PATTERNS.md](./guide/PATTERNS.md)
4. **Check consistency** with architectural principles

## Current Architecture State

**See [ARCHITECTURE.md](./ARCHITECTURE.md) for:**
- System overview with C4 diagrams
- Technology stack reference
- Package boundaries and dependencies
- Communication patterns
- Design system structure
- Anti-patterns checklist

## ADR Index by Category

### Technology Choices

| ADR | Decision | Status | Key Constraint |
|-----|----------|--------|----------------|
| [003](./003-bun.md) | Bun Runtime | Accepted | ES2023, ES modules |
| [010](./010-oxlint.md) | OxLint | Accepted | NOT ESLint |
| [011](./011-css.md) | Native CSS | Accepted | Modern browsers only |

### Architecture Patterns

| ADR | Decision | Status | Key Pattern |
|-----|----------|--------|-------------|
| [001](./001-monorepo.md) | Monorepo Structure | Accepted | Domain separation |
| [004](./004-preact-ws.md) | Preact + WebSocket | Accepted | Real-time first |
| [006](./006-ws-migration.md) | REST→WebSocket | Accepted | WebSocket default |
| [007](./007-bun-serve.md) | Bun.serve() | Accepted | NOT Express |
| [008](./008-logger.md) | Isomorphic Logger | Accepted | Browser + Node |
| [012](./012-design-system.md) | Design System | Accepted | Shared tokens |
| [019](./019-i18n.md) | Type-safe i18n | Accepted | Object refs, not strings |

### Process & Infrastructure

| ADR | Decision | Status | Impact |
|-----|----------|--------|--------|
| [002](./002-license.md) | Mixed Licenses | Accepted | AGPL core, MIT utils |
| [005](./005-ci-cd.md) | CI/CD Structure | Accepted | Monorepo root |
| [009](./009-llm-structure.md) | LLM-Optimized Docs | Accepted | AI-friendly structure |

## ADRs by Impact Area

### Expressio Package
- ADR-001 (monorepo), ADR-003 (Bun), ADR-004 (Preact), ADR-006 (WebSocket), ADR-007 (Bun.serve), ADR-011 (CSS), ADR-019 (i18n)

### Pyrite Package
- ADR-001 (monorepo), ADR-003 (Bun), ADR-004 (Preact), ADR-011 (CSS), ADR-012 (design system), ADR-019 (i18n)

### Common Package
- ADR-004 (WebSocket client), ADR-008 (logger), ADR-011 (design tokens), ADR-012 (components), ADR-019 (i18n utils)

### Infrastructure
- ADR-001 (monorepo), ADR-003 (Bun), ADR-005 (CI/CD), ADR-007 (server), ADR-010 (linting)

## ADRs by Tag

**Frontend**: ADR-004, ADR-011, ADR-012, ADR-019  
**Backend**: ADR-003, ADR-006, ADR-007, ADR-008  
**Infrastructure**: ADR-001, ADR-003, ADR-005, ADR-010  
**Tooling**: ADR-003, ADR-007, ADR-010, ADR-011, ADR-019  
**Performance**: ADR-003, ADR-010, ADR-011  
**UX**: ADR-011, ADR-012, ADR-019  
**Developer Experience**: ADR-003, ADR-010, ADR-019

## Core Principles

1. **Real-time First**: WebSocket default (ADR-004, ADR-006)
2. **Package Boundary Discipline**: Domain separation (ADR-001)
3. **Developer Experience Priority**: Fast iteration (ADR-003, ADR-010)
4. **Commercial/Community Balance**: AGPL/MIT split (ADR-002)
5. **LLM-Optimized Documentation**: AI-friendly structure (ADR-009)
6. **Unified Design System**: Shared tokens (ADR-011, ADR-012)

## Decision Patterns

See [PATTERNS.md](./guide/PATTERNS.md) for reusable frameworks:
- Technology Adoption Pattern
- Migration Pattern
- Architecture Pattern
- Design System Pattern
- Tool Replacement Pattern

## Common Scenarios

**"Should I use REST or WebSocket?"**
→ ADR-004, ADR-006: WebSocket default for real-time features

**"Where should this code live?"**
→ ADR-001: Domain packages (expressio/pyrite) for business logic, common for utilities

**"Should I adopt this tool?"**
→ ADR-003, ADR-010: Evaluate DX (9/10), Performance (8/10), Ecosystem (7/10)

**"How do I style components?"**
→ ADR-011, ADR-012: Use `@import common/css/theme.css`, OKLCH colors, design tokens

**"How do I use translations?"**
→ ADR-019: `$t(i18n.path.to.tag)` with object references, not strings

## Anti-Patterns Checklist

Before proposing changes, verify:
- ❌ Express.js (use Bun.serve per ADR-007)
- ❌ ESLint (use OxLint per ADR-010)
- ❌ SCSS (use native CSS per ADR-011)
- ❌ useState (use DeepSignal per ADR-004)
- ❌ REST for real-time (use WebSocket per ADR-004)
- ❌ Business logic in common (violates ADR-001)
- ❌ Circular package deps (violates ADR-001)
- ❌ Inline styles (use CSS classes per ADR-011)
- ❌ Magic strings for i18n (use object refs per ADR-019)

## Resources

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Current system state with diagrams
- **[PATTERNS.md](./guide/PATTERNS.md)**: Reusable decision frameworks
- **[TEMPLATE-LLM.md](./guide/TEMPLATE-LLM.md)**: Template for new ADRs
- **[AI-REASONING-GUIDE.md](./guide/AI-REASONING-GUIDE.md)**: Detailed LLM guidance

## Notes for AI Assistants

1. **Start with ARCHITECTURE.md** for current state overview
2. **Search ADRs** by category/tag when evaluating decisions
3. **Apply patterns** from PATTERNS.md for similar decisions
4. **Check consistency** against principles and anti-patterns
5. **Cite specific ADRs** in plans to show alignment
6. **Flag contradictions** explicitly with justification
7. **Suggest new ADRs** for architecturally significant decisions

**Workflow**: Plan → Build → ADR → Learning → Better Future Plans
