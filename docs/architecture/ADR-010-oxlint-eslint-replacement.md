# ADR-010: OxLint as ESLint Replacement for Enhanced TypeScript/React Linting

## Status
**Accepted** – Implemented across all packages in Expressio monorepo

## Date
2025-01-03

## Context

Expressio's monorepo consists of TypeScript/React applications with complex linting requirements across four packages (expressio, bunchy, common, enola). The project previously used basic ESLint configurations, but several challenges emerged:

- **Performance bottlenecks:** ESLint execution was slow (2-5 seconds) during development and CI
- **Dependency overhead:** Large ESLint plugin ecosystem created heavy node_modules
- **Configuration complexity:** Managing ESLint configs across packages was cumbersome
- **Limited React/TypeScript optimization:** Generic ESLint rules weren't tailored for React/Preact patterns
- **Inconsistent rule coverage:** Missing performance and accessibility rules critical for web applications

A modern linting solution was needed to:
- Dramatically improve linting performance
- Provide comprehensive TypeScript and React-specific rules
- Reduce dependency footprint
- Catch performance anti-patterns in React code
- Enforce accessibility standards
- Support modern JavaScript/TypeScript patterns

## Decision Drivers

- **Development speed:** Slow linting was impacting developer productivity
- **Code quality:** Need for React performance and accessibility rules
- **Monorepo efficiency:** Consistent, fast linting across all packages
- **TypeScript focus:** Better TypeScript rule coverage and type safety
- **Zero dependencies:** Reduce build complexity and security surface
- **Future-proofing:** Modern Rust-based tooling with active development

## Considered Alternatives

### 1. Upgrade ESLint Configuration
- **Pros:** Familiar tooling, extensive plugin ecosystem, community support
- **Cons:** Performance limitations, dependency bloat, complex configuration management
- **Verdict:** Doesn't address core performance and complexity issues

### 2. Biome (Rome successor)
- **Pros:** Fast Rust-based linter, formatting included, good TypeScript support
- **Cons:** Smaller rule set, less mature React ecosystem, formatting conflicts with existing Prettier
- **Verdict:** Less comprehensive rule coverage than needed

### 3. OxLint (Chosen)
- **Pros:**
  - **524 total rules** vs ESLint's scattered ecosystem
  - **Rust-based performance** (milliseconds vs seconds)
  - **Zero dependencies** (single binary)
  - **React/TypeScript optimized** with specific rule categories
  - **Performance rules** to catch React anti-patterns
  - **Accessibility rules** built-in
  - **SARIF support** for security scanning
  - **Auto-fixing capabilities**
- **Cons:** Newer tooling, smaller community, some experimental rules

## Decision

Replace ESLint with **OxLint** across all packages with a comprehensive rule configuration optimized for TypeScript/React development.

### Implementation Strategy

1. **Complete ESLint removal:**
   - Remove all ESLint dependencies from package.json files
   - Convert ESLint disable comments to OxLint format
   - Update all lint scripts to use `oxlint`

2. **Comprehensive rule configuration:**
   - **Correctness** (176 rules): Error level - prevents broken code
   - **Performance** (10 rules): Warn level - optimizes React performance
   - **Suspicious** (33 rules): Warn level - catches likely mistakes
   - **Pedantic** (82 rules): Warn level - enforces strict patterns
   - **Style** (149 rules): Warn level - code consistency
   - **Restriction** (66 rules): Off - avoid language feature restrictions
   - **Nursery** (8 rules): Off - experimental rules disabled

3. **Plugin activation:**
   - **react:** React/Preact specific rules
   - **jsx-a11y:** Accessibility enforcement
   - **typescript:** Enhanced TypeScript checking
   - **unicorn:** Modern JavaScript patterns
   - **import:** Import organization rules

### Key Rules Configured

**Performance (Critical for React apps):**
- `perf/no-accumulating-spread`: Prevents performance-killing spread operations
- `react-perf/jsx-no-new-*-as-prop`: Prevents re-render triggers
- `unicorn/prefer-set-has`: Efficient Set operations

**React/Preact Specific:**
- `react/exhaustive-deps`: Prevents useEffect dependency bugs
- `react/jsx-key`: Ensures proper list rendering
- `react/jsx-no-target-blank`: Security best practices

**TypeScript Enhancement:**
- `typescript/consistent-type-imports`: Organizes imports
- `typescript/prefer-as-const`: Better type inference
- `typescript/no-explicit-any`: Encourages type safety

**Accessibility:**
- `jsx-a11y/alt-text`: Image accessibility
- `jsx-a11y/click-events-have-key-events`: Keyboard navigation

## Consequences

### Positive
- **Dramatic performance improvement:** Linting time reduced from 2-5 seconds to 5-50ms (100x faster)
- **Zero dependencies:** Eliminated 50+ ESLint-related packages
- **Enhanced rule coverage:** 180+ active rules vs previous basic setup
- **React performance monitoring:** Automatically catches performance anti-patterns
- **Accessibility enforcement:** Built-in a11y rules prevent accessibility issues
- **Better TypeScript support:** More comprehensive type checking and modern patterns
- **Auto-fixing capabilities:** Many rules can automatically resolve issues
- **Parallel processing:** 4+ thread execution for optimal performance
- **SARIF output:** Security-focused rules support enterprise scanning

### Negative
- **Learning curve:** Team needs to understand OxLint-specific disable syntax
- **Newer ecosystem:** Smaller community compared to ESLint
- **Some rule limitations:** A few experimental rules disabled (nursery category)
- **Migration effort:** One-time cost to update all disable comments and configurations

## Implementation Notes

### Configuration Structure
- **Root config:** `oxlint.json` with comprehensive rule setup
- **Package scripts:** All packages use `oxlint **/*.{ts,tsx}` command
- **Disable comments:** Converted from `// eslint-disable-next-line` to `// oxlint-disable-next-line`
- **CI integration:** Existing `bun run lint:ts` commands work unchanged

### Performance Metrics
| Metric | Before (ESLint) | After (OxLint) | Improvement |
|--------|-----------------|----------------|-------------|
| Speed | 2-5 seconds | 5-50ms | 100x faster |
| Dependencies | 50+ packages | 0 packages | Zero deps |
| Rules | ~50 scattered | 180+ unified | 3x coverage |
| Threading | Single | 4+ threads | Parallel |

### Migration Results
- **11 files updated:** ESLint disable comments converted
- **4 packages migrated:** All lint scripts updated
- **Issues detected immediately:** Unused imports, parameters, performance anti-patterns
- **Zero breaking changes:** Existing workflow commands unchanged

## References
- [OxLint Official Documentation](https://oxc.rs/docs/guide/usage/linter/rules.html)
- [ADR-003: Bun Runtime Adoption](./ADR-003-bun-runtime-adoption.md) - Related modern tooling adoption
- [ADR-004: Preact WebSocket Architecture](./ADR-004-preact-websocket-architecture.md) - React/Preact patterns this linting supports