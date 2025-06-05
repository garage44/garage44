# ADR-003: Bun as Primary Runtime

## Status
Accepted

## Date
2025-04-17 (from initial project setup)

## Context

The project needed a JavaScript runtime and package manager. The main options considered were:

- **Node.js + npm/yarn**: Traditional, mature ecosystem
- **Node.js + pnpm**: Better monorepo support, faster installs
- **Bun**: Modern runtime with built-in bundling, faster startup times
- **Deno**: Modern runtime with TypeScript support, different module system

Key requirements:
- Fast development iteration cycles
- Built-in TypeScript support without complex build setup
- Good monorepo workspace support
- Fast package installation
- Modern JavaScript features (ES2023)
- Integrated bundling for frontend builds

## Decision

Adopt Bun as the primary runtime and package manager for the entire Expressio project.

**Runtime Configuration:**
- Target ES2023 for modern JavaScript features
- Use `type: "module"` for ES modules throughout
- Configure TypeScript with `"moduleResolution": "bundler"`
- Leverage Bun's built-in bundler for frontend builds

**Development Workflow:**
- `bun run dev` for development with hot reload
- `bun run build` for production builds
- Bun workspaces for monorepo dependency management

## Consequences

### Positive
- **Development Speed**: Significantly faster startup times and package installs
- **Simplified Toolchain**: Built-in bundler eliminates webpack/vite configuration
- **TypeScript Integration**: Native TypeScript execution without transpilation step
- **Modern Standards**: ES2023 support, modern module resolution
- **Monorepo Support**: Excellent workspace dependency handling
- **Single Tool**: Runtime, package manager, and bundler in one

### Negative
- **Ecosystem Maturity**: Smaller ecosystem compared to Node.js
- **Package Compatibility**: Some npm packages may have compatibility issues
- **Production Risk**: Less battle-tested in production environments
- **Team Knowledge**: Team needs to learn Bun-specific features and quirks
- **CI/CD Setup**: May need special setup in some CI environments

## Implementation Notes
- All packages use `"type": "module"` in package.json
- TypeScript configured with bundler module resolution
- Bun-specific types added to development dependencies
- Development scripts use `bun run --watch` for hot reload
- Production builds use Bun's built-in bundler

## Monitoring
- Track any package compatibility issues
- Monitor build performance improvements
- Watch for production stability issues
- Keep Node.js as fallback option if needed

## Future Considerations
- Consider Node.js compatibility layer if ecosystem issues arise
- Monitor Bun ecosystem maturity and adoption
- Evaluate migration path if runtime change becomes necessary