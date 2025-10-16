# Garage44 AI Decision Records (ADRs)

This directory contains **AI-optimized Decision Records** that document architectural decisions and enable LLMs to understand patterns, extrapolate principles, and maintain architectural consistency.

## What are AI Decision Records?

AI Decision Records (ADRs) are structured documents that capture important architectural decisions with machine-readable metadata, explicit reasoning chains, and reusable patterns. They serve two purposes:

1. **For Humans**: Understand "why we built it this way"
2. **For AI**: Learn from past decisions to make better future decisions

## Quick Start for AI Assistants

**Before making architectural decisions:**

1. 📖 **Read this file** for overview and core principles
2. 🔍 **Search ADRs** for relevant decisions (see [How to Search](#how-to-search-adrs))
3. 📋 **Apply patterns** from [PATTERNS.md](./guide/PATTERNS.md)
4. 🤖 **Follow guide** in [AI-REASONING-GUIDE.md](./guide/AI-REASONING-GUIDE.md)
5. ✅ **Check consistency** with architectural principles below

**After successful implementation:**
- Document significant decisions using [TEMPLATE.md](./guide/TEMPLATE.md)
- Convert plans to ADRs using [PLAN-TO-ADR-TEMPLATE.md](./guide/PLAN-TO-ADR-TEMPLATE.md)

## ADR Index

### All ADRs (Chronological)

| ID | Title | Type | Status | Date |
|----|-------|------|--------|------|
| [001](./ADR-001-monorepo-package-separation.md) | Monorepo Structure with Package Separation | Architecture | Accepted | 2025-04-17 |
| [002](./ADR-002-mixed-license-strategy.md) | Mixed License Strategy | Process | Accepted | 2025-04-17 |
| [003](./ADR-003-bun-runtime-adoption.md) | Bun as Primary Runtime | Technology | Accepted | 2025-04-17 |
| [004](./ADR-004-preact-websocket-architecture.md) | Preact + WebSocket Real-time Architecture | Architecture | Accepted | 2025-04-17 |
| [005](./ADR-005-centralized-ci-cd.md) | Centralized CI/CD at Monorepo Root | Infrastructure | Accepted | 2025-04-17 |
| [006](./ADR-006-rest-to-websocket-migration.md) | REST to WebSocket Migration | Architecture | Accepted | 2025-06-02 |
| [007](./ADR-007-bun-serve-migration.md) | Migration to Bun.serve | Tool | Accepted | 2025-06-02 |
| [008](./ADR-008-isomorphic-logger.md) | Isomorphic Logger Implementation | Architecture | Accepted | 2025-06-02 |
| [009](./ADR-009-llm-optimized-project-structure.md) | LLM-Optimized Project Structure | Process | Accepted | 2025-01-27 |
| [010](./ADR-010-oxlint-eslint-replacement.md) | OxLint as ESLint Replacement | Tool | Accepted | 2025-01-03 |
| [011](./ADR-011-modern-css-migration.md) | Modern CSS Migration | Tool | Accepted | 2025-10-11 |
| [012](./ADR-012-design-system-consolidation.md) | Design System Consolidation | Architecture | Accepted | 2025-10-15 |
| [013](./ADR-013-theme-switching-system.md) | Theme Switching System | Architecture | Accepted | 2025-10-15 |
| [014](./ADR-014-unified-theme-system.md) | Unified Theme System | Architecture | Accepted | 2025-10-16 |

### ADRs by Decision Type

**Technology Choices** (Runtime, Framework, Library):
- [ADR-003](./ADR-003-bun-runtime-adoption.md): Bun as Primary Runtime
- Pattern: [Technology Adoption Pattern](./guide/PATTERNS.md#technology-adoption-pattern)

**Architecture Patterns** (Structure, Communication):
- [ADR-001](./ADR-001-monorepo-package-separation.md): Monorepo Structure
- [ADR-004](./ADR-004-preact-websocket-architecture.md): Preact + WebSocket
- [ADR-006](./ADR-006-rest-to-websocket-migration.md): REST to WebSocket Migration
- [ADR-008](./ADR-008-isomorphic-logger.md): Isomorphic Logger
- [ADR-012](./ADR-012-design-system-consolidation.md): Design System Consolidation
- [ADR-013](./ADR-013-theme-switching-system.md): Theme Switching
- [ADR-014](./ADR-014-unified-theme-system.md): Unified Theme System
- Pattern: [Architecture Pattern](./guide/PATTERNS.md#architecture-pattern)

**Tool Adoption/Replacement** (Developer Tooling):
- [ADR-007](./ADR-007-bun-serve-migration.md): Migration to Bun.serve
- [ADR-010](./ADR-010-oxlint-eslint-replacement.md): OxLint replacing ESLint
- [ADR-011](./ADR-011-modern-css-migration.md): Modern CSS Migration
- Pattern: [Tool Replacement Pattern](./guide/PATTERNS.md#tool-replacement-pattern)

**Process Changes** (Workflow, Practices):
- [ADR-002](./ADR-002-mixed-license-strategy.md): Mixed License Strategy
- [ADR-005](./ADR-005-centralized-ci-cd.md): Centralized CI/CD
- [ADR-009](./ADR-009-llm-optimized-project-structure.md): LLM-Optimized Structure
- Pattern: Various (Process-specific)

### ADRs by Impact Area

**Common Package** (Shared utilities):
- ADR-004, ADR-008, ADR-011, ADR-012, ADR-014

**Expressio** (i18n application):
- ADR-001, ADR-003, ADR-004, ADR-006, ADR-007, ADR-011

**Pyrite** (Video conferencing):
- ADR-001, ADR-003, ADR-004, ADR-011, ADR-012

**Infrastructure** (Build, deployment):
- ADR-001, ADR-003, ADR-005, ADR-007, ADR-010, ADR-011

### ADRs by Tag

**Frontend**: ADR-004, ADR-011, ADR-012, ADR-013, ADR-014
**Backend**: ADR-003, ADR-006, ADR-007, ADR-008
**Tooling**: ADR-003, ADR-007, ADR-010, ADR-011
**Performance**: ADR-003, ADR-010, ADR-011
**UX**: ADR-011, ADR-012, ADR-013, ADR-014

## Architectural Principles

Based on these decisions, the Garage44 monorepo follows these core principles:

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
- Adopt Rust-based tooling for performance gains (OxLint, Bun)

### 4. **Commercial/Community Balance**
- Protect core business logic with AGPL
- Enable community growth with MIT utilities
- Build extensible foundations for future commercial features

### 5. **LLM-Optimized Strategic Reasoning**
- Structure documentation to support AI-assisted decision making
- Maintain clear traceability between technical and business decisions
- Centralize strategic context for improved reasoning capabilities
- Enable automated analysis of project evolution and market fit

### 6. **Unified Design System**
- Maintain consistent visual identity across all projects (Pyrite, Expressio)
- Share design tokens and components through `@garage44/common` package
- Use modern CSS features (native nesting, custom properties, OKLCH colors)
- Prioritize accessibility and theme support in all user interfaces

## How to Search ADRs

### For AI Assistants

**Semantic Search (Recommended)**:
```
Use codebase_search with natural language questions:
- "How should I implement real-time features?" → ADR-004, ADR-006
- "What CSS approach should I use?" → ADR-011, ADR-012
- "How is the monorepo structured?" → ADR-001
```

**Keyword Search**:
```bash
# Search for specific technologies
grep -i "websocket\|bun\|preact\|css" adr/*.md

# Search for patterns
grep -i "migration\|adoption\|replacement" adr/*.md

# Search PATTERNS.md for decision frameworks
grep -i "technology adoption\|migration pattern" adr/guide/PATTERNS.md
```

**By Topic**:
- **Real-time/WebSocket**: ADR-004, ADR-006
- **Build/Runtime**: ADR-003, ADR-007, ADR-010
- **Design System**: ADR-011, ADR-012, ADR-013, ADR-014
- **Architecture**: ADR-001, ADR-004, ADR-008
- **Migration**: ADR-006, ADR-007, ADR-011

### For Humans

1. Start with this README for overview
2. Check [PATTERNS.md](./guide/PATTERNS.md) for decision frameworks
3. Search by decision type, impact area, or tag above
4. Read [AI-REASONING-GUIDE.md](./guide/AI-REASONING-GUIDE.md) for detailed guidance

## Common Decision Scenarios

**Scenario: "Should I use REST or WebSocket for this API?"**
- 📖 Read: ADR-004 (WebSocket Architecture), ADR-006 (REST to WebSocket Migration)
- 🎯 Pattern: Architecture Pattern
- ✅ Default: WebSocket for user-facing real-time features
- 💡 Exception: REST acceptable for one-time operations

**Scenario: "Where should this code/component live?"**
- 📖 Read: ADR-001 (Monorepo Structure)
- 🎯 Pattern: Architecture Pattern
- ✅ Common: Shared utilities, MIT licensed, domain-agnostic
- ✅ Expressio/Pyrite: Business logic, app-specific, AGPL

**Scenario: "Should I adopt this new tool/library?"**
- 📖 Read: ADR-003 (Bun), ADR-010 (OxLint)
- 🎯 Pattern: Technology Adoption Pattern
- ✅ Evaluate: DX (9/10), Performance (8/10), Ecosystem (7/10)
- ✅ Validate: Proof-of-concept before committing

**Scenario: "How do I migrate from X to Y?"**
- 📖 Read: ADR-006, ADR-007, ADR-011 (various migrations)
- 🎯 Pattern: Migration Pattern
- ✅ Approach: Incremental, with rollback plan
- ✅ Validate: Start small, measure, expand

**Scenario: "How should I style this component?"**
- 📖 Read: ADR-011 (Modern CSS), ADR-012 (Design System)
- 🎯 Pattern: Design System Pattern
- ✅ Use: Design tokens from `@garage44/common/css/theme.css`
- ✅ Avoid: Inline styles, hardcoded values

**Scenario: "Should I replace this development tool?"**
- 📖 Read: ADR-010 (OxLint replacing ESLint)
- 🎯 Pattern: Tool Replacement Pattern
- ✅ Benchmark: 10x improvement target
- ✅ Validate: Feature parity, real codebase testing

## Using ADRs for AI Reasoning

### AI Learning Cycle

```
User Request
     ↓
AI Searches ADRs
     ↓
AI Applies Patterns
     ↓
AI Creates Plan (citing ADRs)
     ↓
User Approves Plan
     ↓
AI Implements
     ↓
AI Suggests ADR (if significant)
     ↓
User Creates ADR
     ↓
Future AI Learns from ADR
```

### Key Files for AI Context

1. **README.md** (this file): Overview, principles, quick search
2. **guide/PATTERNS.md**: Reusable decision frameworks with criteria
3. **guide/AI-REASONING-GUIDE.md**: Detailed guidance on using ADRs
4. **guide/TEMPLATE.md**: Structure for creating new ADRs
5. **guide/PLAN-TO-ADR-TEMPLATE.md**: Converting plans to ADRs

### AI Decision-Making Process

**Step 1: Identify Decision Type**
- Technology, Architecture, Tool, Process?

**Step 2: Search Relevant ADRs**
- Use codebase_search or grep
- Check related decisions

**Step 3: Apply Pattern**
- Use framework from guide/PATTERNS.md
- Evaluate with pattern criteria

**Step 4: Check Consistency**
- Validate against architectural principles
- Ensure no contradictions with existing ADRs

**Step 5: Document Decision**
- Cite ADRs in plan
- Suggest new ADR if significant

### Prompt Templates for AI

**When Creating Plan**:
```
Before proposing [feature/change], I will:
1. Search adr/ for relevant decisions
2. Apply [Pattern Name] from guide/PATTERNS.md
3. Verify consistency with architectural principles
4. Cite specific ADRs in my plan
```

**When Evaluating Technology**:
```
To evaluate [technology], I will:
1. Review ADR-003 (Technology Adoption Pattern)
2. Score against criteria: DX, Performance, Ecosystem
3. Compare to existing stack decisions
4. Identify any contradictions
```

**When Detecting Inconsistency**:
```
This appears to contradict ADR-XXX because [reason].
Either:
- Follow ADR-XXX pattern (recommended)
- Justify deviation and suggest updating ADR-XXX
```

## Adding New ADRs

**When to Create an ADR:**
- ✅ Affects multiple packages or applications
- ✅ Introduces new architectural pattern
- ✅ Adopts new core technology (runtime, framework)
- ✅ Changes build or deployment process
- ✅ Establishes new development practices

**How to Create an ADR:**

1. **Use Template**: Start with [TEMPLATE.md](./guide/TEMPLATE.md)
2. **Add Metadata**: Fill in YAML frontmatter (id, tags, impact areas, etc.)
3. **Document Decision**: Context, Decision, Consequences
4. **Extract Pattern**: Make it reusable for future decisions
5. **Add AI Prompts**: Guide future LLM reasoning
6. **Update This README**: Add to index tables above
7. **Consider Principles**: Update architectural principles if needed

**For Converting Plans to ADRs:**
- Follow [PLAN-TO-ADR-TEMPLATE.md](./guide/PLAN-TO-ADR-TEMPLATE.md)
- Add retrospective analysis (lessons learned)
- Include actual metrics vs. predicted
- Document what worked / what didn't

## Decision Pattern Library

See [PATTERNS.md](./guide/PATTERNS.md) for complete library. Summary:

| Pattern | Use When | Key ADRs | Success Rate |
|---------|----------|----------|--------------|
| [Technology Adoption](./guide/PATTERNS.md#technology-adoption-pattern) | Adopting new runtime/framework | ADR-003, ADR-010 | High |
| [Migration](./guide/PATTERNS.md#migration-pattern) | Moving from X to Y | ADR-006, ADR-007, ADR-011 | High |
| [Architecture](./guide/PATTERNS.md#architecture-pattern) | Defining structure/boundaries | ADR-001, ADR-004 | High |
| [Design System](./guide/PATTERNS.md#design-system-pattern) | UI/styling decisions | ADR-011, ADR-012 | High |
| [Tool Replacement](./guide/PATTERNS.md#tool-replacement-pattern) | Replacing dev tools | ADR-010 | High |

## Technology Stack Reference

**Established by ADRs (Don't contradict without justification):**

| Technology | ADR | Alternative Rejected |
|------------|-----|---------------------|
| Runtime: Bun | ADR-003 | Node.js, Deno |
| Frontend: Preact | ADR-004 | React, Vue |
| State: DeepSignal | ADR-004 | Redux, Zustand |
| Communication: WebSocket | ADR-004, ADR-006 | REST, SSE |
| Server: Bun.serve | ADR-007 | Express.js |
| CSS: Native CSS | ADR-011 | SCSS, Tailwind |
| Linter: OxLint | ADR-010 | ESLint |
| Colors: OKLCH | ADR-011 | RGB, HSL |

## Architectural Drift Warnings

**Red Flags for AI Assistants:**

- ⚠️ Proposing Express.js (contradicts ADR-007)
- ⚠️ Using ESLint (contradicts ADR-010)
- ⚠️ Writing SCSS (contradicts ADR-011)
- ⚠️ Using REST for real-time user features (contradicts ADR-004, ADR-006)
- ⚠️ Inline styles or hardcoded colors (contradicts ADR-011, ADR-012)
- ⚠️ Business logic in common package (contradicts ADR-001)
- ⚠️ Circular package dependencies (contradicts ADR-001)

If you detect these patterns, flag them and suggest following the established ADR.

## Future Considerations

Watch for decisions that might need new ADRs:
- **Expressio**: Translation provider integrations, performance optimization
- **Pyrite**: WebRTC architecture, recording formats
- **Infrastructure**: Deployment strategies, monitoring systems
- **Security**: Authentication patterns, API security
- **AI Integration**: LLM usage patterns, prompt engineering
- **Community**: Contribution workflows, plugin systems