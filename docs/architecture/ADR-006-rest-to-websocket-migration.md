# ADR-006: REST to WebSocket Migration for Workspaces API

## Status
Accepted

## Date
2025-06-02 (from commit `7d98433`)

## Context

The workspaces API was initially implemented as a traditional REST endpoint:
- `GET /api/workspaces` for fetching workspace data
- Standard HTTP request/response pattern
- Client-side polling or manual refresh for updates

However, this approach had limitations for Expressio's use case:
- **Translation Updates**: When AI translation completes, users don't see results immediately
- **Collaboration**: Multiple users working on translations don't see each other's changes
- **Progress Feedback**: No real-time progress updates during batch translation operations
- **User Experience**: Manual refresh required to see updated translation status

The project already had WebSocket infrastructure in place (from ADR-004), making real-time updates technically feasible.

## Decision

Migrate the workspaces GET endpoint from REST to WebSocket communication.

**Technical Changes:**
- Modified `packages/common/lib/ws-client.ts` to handle workspace subscriptions
- Updated `packages/expressio/api/workspaces.ts` to send data via WebSocket
- Changed `packages/expressio/src/components/main/main.tsx` to subscribe to WebSocket updates

**Communication Pattern:**
- Client subscribes to workspace updates via WebSocket
- Server pushes workspace data changes in real-time
- Maintains REST endpoints for initial data loading and fallback

## Consequences

### Positive
- **Real-time Updates**: Users see translation changes instantly without refresh
- **Better Collaboration**: Multiple users can work simultaneously with live sync
- **Progress Visibility**: AI translation progress shown in real-time
- **Improved UX**: No manual refresh needed, always up-to-date data
- **Consistent Architecture**: Aligns with real-time-first approach (ADR-004)
- **Efficient**: Push updates only when data changes, reducing unnecessary requests

### Negative
- **Connection Dependency**: Workspace data updates require active WebSocket connection
- **Complexity**: More complex state management than simple REST calls
- **Error Handling**: Need to handle WebSocket disconnections gracefully
- **Debugging**: Harder to debug real-time updates vs request/response logs
- **Fallback Required**: Still need REST endpoints for connection failures

## Implementation Details

**WebSocket Message Format:**
```typescript
{
  type: 'workspace_update',
  data: WorkspaceData,
  timestamp: number
}
```

**Client-side Subscription:**
```typescript
ws.subscribe('workspaces', (data) => {
  // Update workspace state in real-time
  store.update('workspace', data)
})
```

**Server-side Broadcasting:**
- Workspace changes broadcast to all connected clients
- Selective updates based on user permissions
- Debounced updates to prevent spam during bulk operations

## Migration Strategy

This represents a broader pattern of migrating from REST to WebSocket:
1. **Start with REST**: Initial implementation for simplicity
2. **Identify Real-time Needs**: Find endpoints that benefit from live updates
3. **Gradual Migration**: Move endpoints to WebSocket as benefits become clear
4. **Maintain Fallbacks**: Keep REST endpoints for reliability

## Future Applications

This pattern should be applied to other endpoints that would benefit from real-time updates:
- Translation progress updates
- User collaboration events
- Configuration changes
- Error notifications

## Related Decisions
- Builds on ADR-004 (Preact + WebSocket Architecture)
- Demonstrates the real-time-first principle in practice
- Establishes pattern for future API endpoint migrations