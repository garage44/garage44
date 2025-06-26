# ADR-007: Migration from Express and Ws to Bun.serve and Bun WebSockets

## Status

**Recommended** - Migration should proceed due to Bun runtime compatibility constraints

## Context

Expressio currently uses Express.js as its HTTP server framework and the `ws` library for WebSocket functionality. The project runs on Bun runtime, which provides native HTTP server capabilities through `Bun.serve()` and built-in WebSocket support. **Critical constraint**: The `ws` library has a bug in Bun's newer runtimes, forcing Expressio to remain on an older version of Bun and preventing access to newer Bun features, performance improvements, and security updates.

This ADR evaluates the benefits and trade-offs of migrating from the current Express + Ws stack to Bun's native server capabilities, with particular emphasis on resolving the Bun runtime compatibility issue.

## Current Architecture

### Express + Ws Implementation

The current implementation uses:
- **Express.js** (v5) for HTTP server and middleware
- **ws** library (v8.18.1) for WebSocket server
- **express-session** for session management
- **express-winston** for logging middleware
- **cookie-parser** for cookie handling
- **path-to-regexp** for route matching

Key components:
- `packages/expressio/service.ts` - Main server setup with Express
- `packages/common/lib/ws-server.ts` - WebSocket server implementation using `ws`
- `packages/common/lib/middleware.ts` - Express middleware setup
- `packages/expressio/lib/ws-server.ts` - Expressio-specific WebSocket integration

### Current Server Setup

```typescript
// Current Express setup
export const app = express()
const server = new Server(app)
const wss = new WebSocketServer({
    path: '/ws',
    server: options.server,
})
server.listen(argv.port, argv.host)
```

### Critical Constraint: Bun Runtime Compatibility

**The `ws` library has a bug in Bun's newer runtimes**, which:
- Forces Expressio to remain on an older version of Bun
- Prevents access to newer Bun features and performance improvements
- Blocks security updates and bug fixes in newer Bun versions
- Creates technical debt and maintenance burden
- Limits the project's ability to leverage Bun's evolving ecosystem

## Proposed Architecture

### Bun.serve + Bun WebSockets

The proposed implementation would use:
- **Bun.serve()** for HTTP server with native performance
- **Bun's built-in WebSocket support** for real-time communication
- **Custom middleware system** compatible with Bun.serve
- **Native session handling** or lightweight session library
- **Bun's built-in logging** or custom logging middleware

## Decision Drivers

### Bun Runtime Compatibility (Critical)

**Pros:**
- **Resolve Runtime Constraint**: Eliminate the `ws` library bug and enable use of latest Bun versions
- **Access to New Features**: Leverage latest Bun performance improvements, security updates, and features
- **Future-Proofing**: Ensure compatibility with ongoing Bun development
- **Ecosystem Alignment**: Better integration with Bun's evolving tooling and ecosystem
- **Security**: Access to latest security patches and updates in Bun runtime

**Cons:**
- **Migration Effort**: Significant refactoring required to replace Express + ws stack
- **Testing Complexity**: Need to validate all functionality with new implementation

### Performance Benefits

**Pros:**
- **Native Performance**: Bun.serve is built on top of uWebSockets.js, providing significantly better performance than Express
- **Reduced Memory Footprint**: Eliminates Express.js overhead and reduces bundle size
- **Faster Startup**: Native Bun server starts faster than Express + Node.js HTTP server
- **Better Concurrency**: Bun's event loop and async handling are more efficient
- **WebSocket Performance**: Native WebSocket implementation avoids the `ws` library overhead

**Cons:**
- **Performance gains may be minimal** for Expressio's current scale (single-user tooling application)
- **Express.js is already well-optimized** for typical web application workloads

### Developer Experience

**Pros:**
- **Simplified Dependencies**: Remove Express.js, ws, and related middleware dependencies
- **Native Integration**: Better integration with Bun's ecosystem and tooling
- **TypeScript Support**: Bun.serve has excellent TypeScript support out of the box
- **Consistent Runtime**: Everything runs natively in Bun without Node.js compatibility layers
- **Modern Development**: Access to latest Bun development tools and features

**Cons:**
- **Learning Curve**: Team needs to learn Bun.serve API and patterns
- **Ecosystem Maturity**: Express.js has a more mature ecosystem and documentation
- **Middleware Compatibility**: Need to rewrite or adapt existing middleware
- **Debugging Tools**: Express.js has better debugging and profiling tools

### Code Complexity

**Pros:**
- **Simplified Architecture**: Single server implementation instead of Express + HTTP server + WebSocket server
- **Reduced Abstraction Layers**: Direct Bun.serve API without Express middleware stack
- **Cleaner WebSocket Integration**: Native WebSocket support without external library
- **Eliminate Compatibility Layer**: Remove Node.js compatibility overhead

**Cons:**
- **Migration Effort**: Significant refactoring required across multiple packages
- **Middleware Rewrite**: Need to reimplement session handling, logging, authentication
- **Route Handling**: Different routing patterns and middleware composition
- **Testing Complexity**: Need to update tests and mocking strategies

### Maintenance and Ecosystem

**Pros:**
- **Fewer Dependencies**: Remove Express.js, ws, express-session, express-winston, cookie-parser
- **Bun Native**: Better alignment with Bun's development roadmap
- **Security**: Fewer third-party dependencies reduce attack surface
- **Bundle Size**: Smaller production bundles
- **Runtime Updates**: Ability to update Bun runtime without compatibility issues

**Cons:**
- **Ecosystem Risk**: Bun.serve is newer and less battle-tested than Express.js
- **Community Support**: Smaller community and fewer resources for troubleshooting
- **Migration Risk**: Potential for introducing bugs during migration
- **Vendor Lock-in**: Increased dependency on Bun's WebSocket implementation

## Implementation Considerations

### Migration Strategy

1. **Incremental Migration**: Start with HTTP routes, then migrate WebSocket functionality
2. **Dual Support**: Maintain Express compatibility during transition period
3. **Feature Parity**: Ensure all current functionality works with new implementation
4. **Testing**: Comprehensive testing of WebSocket real-time features
5. **Bun Version Upgrade**: Plan for upgrading to latest Bun version after migration

### Required Changes

#### Core Server (`packages/expressio/service.ts`)
```typescript
// Proposed Bun.serve setup
const server = Bun.serve({
    port: argv.port,
    hostname: argv.host,
    fetch: handleRequest,
    websocket: handleWebSocket,
})
```

#### WebSocket Server (`packages/common/lib/ws-server.ts`)
```typescript
// Proposed Bun WebSocket implementation
function handleWebSocket(ws: ServerWebSocket) {
    // Native Bun WebSocket handling
    ws.onmessage = async (message) => {
        // Handle WebSocket messages
    }
}
```

#### Middleware System (`packages/common/lib/middleware.ts`)
```typescript
// Proposed Bun.serve middleware
const middleware = compose([
    sessionMiddleware,
    authMiddleware,
    loggingMiddleware,
    // ... other middleware
])
```

### Compatibility Challenges

1. **Session Management**: Express-session compatibility with Bun.serve
2. **Route Matching**: Path-to-regexp patterns in Bun.serve context
3. **WebSocket API**: Differences between `ws` library and Bun WebSocket API
4. **Middleware Composition**: Express middleware patterns vs Bun.serve handlers
5. **Error Handling**: Different error handling patterns and middleware

## Alternatives Considered

### Alternative 1: Keep Current Stack
- **Pros**: Stable, well-tested, mature ecosystem
- **Cons**: **Forced to use older Bun version**, performance overhead, dependency on Node.js compatibility layer, **blocks access to Bun improvements**

### Alternative 2: Hybrid Approach
- **Pros**: Gradual migration, reduced risk
- **Cons**: Increased complexity, maintenance burden, **still requires ws library**

### Alternative 3: Other Bun-Compatible WebSocket Libraries
- **Pros**: Mature WebSocket libraries with Bun support
- **Cons**: Still external dependencies, may have similar compatibility issues, may not provide same performance benefits

### Alternative 4: Wait for ws Library Fix
- **Pros**: Minimal code changes required
- **Cons**: **Uncertain timeline**, **blocks Bun updates indefinitely**, **dependency on third-party fix**

## Recommendation

**Proceed with migration to Bun.serve and Bun WebSockets** with the following rationale:

### Primary Reasons to Migrate

1. **Critical Runtime Constraint**: The `ws` library bug prevents using newer Bun versions, creating a significant technical debt
2. **Bun Ecosystem Access**: Migration enables access to latest Bun features, performance improvements, and security updates
3. **Future-Proofing**: Ensures long-term compatibility with Bun's development roadmap
4. **Performance Benefits**: Native Bun.serve and WebSocket implementation provides better performance
5. **Dependency Reduction**: Eliminates problematic `ws` dependency and reduces overall dependency footprint

### Migration Timeline

- **Single Day Implementation**: Complete migration from Express + ws to Bun.serve + Bun WebSockets
- **Immediate Testing**: Validate all functionality works with new implementation
- **Deployment**: Deploy updated version with latest Bun runtime support

### Risk Mitigation

1. **Focused Scope**: Target single-day implementation with clear feature parity requirements
2. **Comprehensive Testing**: Ensure all current functionality works with new implementation
3. **Rollback Plan**: Maintain ability to revert to Express + ws if critical issues arise
4. **Documentation**: Update code comments and patterns for Bun.serve implementation

## Consequences

### Positive Consequences of Migration
- **Runtime Freedom**: Ability to use latest Bun versions and features
- **Performance**: Improved performance through native Bun implementation
- **Maintenance**: Reduced dependency management and compatibility issues
- **Future-Proofing**: Better alignment with Bun's development roadmap
- **Security**: Access to latest security updates and patches

### Negative Consequences of Migration
- **Development Overhead**: Significant migration effort and learning curve
- **Risk**: Potential for introducing bugs during migration
- **Temporary Instability**: Period of adjustment to new patterns and APIs
- **Resource Allocation**: Migration effort diverts resources from feature development

### Consequences of Not Migrating
- **Runtime Lock-in**: Forced to remain on older Bun version indefinitely
- **Technical Debt**: Accumulating compatibility issues and maintenance burden
- **Feature Limitations**: Inability to leverage latest Bun improvements
- **Security Risk**: Missing security updates and patches in newer Bun versions

## References

- [Bun.serve Documentation](https://bun.sh/docs/api/http)
- [Bun WebSocket API](https://bun.sh/docs/api/websockets)
- [Express.js Performance](https://expressjs.com/en/advanced/best-practices-performance.html)
- [ws Library Documentation](https://github.com/websockets/ws)
- [ADR-003: Bun Runtime Adoption](./ADR-003-bun-runtime-adoption.md)
- [ADR-006: REST to WebSocket Migration](./ADR-006-rest-to-websocket-migration.md)