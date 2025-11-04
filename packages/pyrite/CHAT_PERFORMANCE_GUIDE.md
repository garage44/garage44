# Chat Performance Guide

Quick reference guide for maintaining optimal chat performance in Pyrite.

## ⚡ Performance Checklist

### Before Deploying Changes

- [ ] **Message batching enabled** (50ms window)
- [ ] **Memoization used** for sorted messages and typing indicators
- [ ] **Pagination implemented** (default 50 messages)
- [ ] **Loading states tracked** to prevent duplicate requests
- [ ] **Hardware acceleration** enabled for scroll containers
- [ ] **Regex patterns pre-compiled** for WebSocket routing
- [ ] **Database indexes** created on frequently queried columns

### Monitoring Performance

Use browser DevTools to monitor:

1. **Component Re-renders**
   - Use React DevTools Profiler
   - Check for unnecessary re-renders
   - Verify memoization is working

2. **Network Traffic**
   - Monitor WebSocket message frequency
   - Check for duplicate requests
   - Verify batch size is appropriate

3. **Memory Usage**
   - Watch for memory leaks in message arrays
   - Monitor WebSocket connection cleanup
   - Check for orphaned event listeners

4. **Rendering Performance**
   - Target: 60 FPS scrolling
   - Measure: Use Performance tab
   - Optimize: Reduce layout thrashing

## 🎯 Performance Targets

### Response Times
- Initial channel load: < 500ms
- Message send: < 100ms
- Typing indicator: < 50ms
- Load more messages: < 300ms

### Resource Usage
- Memory per 1000 messages: < 10MB
- CPU during idle: < 5%
- CPU during message burst: < 30%

### User Experience
- Scroll FPS: 60 FPS
- Message render: < 50ms
- Input lag: < 16ms
- Typing indicator latency: < 200ms

## 🔧 Optimization Techniques

### 1. State Updates
```typescript
// ❌ Bad: Multiple state updates
messages.forEach(msg => {
  $s.chat.channels[slug].messages.push(msg)
})

// ✅ Good: Single batch update
$s.chat.channels[slug].messages.push(...messages)
```

### 2. Memoization
```typescript
// ❌ Bad: Sort on every render
const sorted = messages.sort((a, b) => a.time - b.time)

// ✅ Good: Memoize sorted result
const sorted = useMemo(() => 
  [...messages].sort((a, b) => a.time - b.time),
  [messages]
)
```

### 3. Event Handlers
```typescript
// ❌ Bad: Create new function on every render
<button onClick={() => sendMessage(text)}>Send</button>

// ✅ Good: Use stable callback
const handleSend = useCallback(() => sendMessage(text), [text])
<button onClick={handleSend}>Send</button>
```

### 4. WebSocket Subscriptions
```typescript
// ❌ Bad: Subscribe in component
ws.on('/channels/general/messages', handler)

// ✅ Good: Subscribe once globally with routing
ws.on('message', (msg) => {
  const match = msg.url.match(CHANNEL_PATTERN)
  if (match) handleChannelMessage(msg)
})
```

## 🐛 Common Performance Issues

### Issue: Chat becomes slow with many messages

**Symptoms:**
- Scrolling lags
- Input delay
- High CPU usage

**Solutions:**
1. Enable message pagination
2. Implement virtual scrolling
3. Limit initial message load
4. Clear old messages from state

### Issue: Excessive re-renders

**Symptoms:**
- CPU spikes on new messages
- DevTools shows many renders
- UI feels sluggish

**Solutions:**
1. Add memoization to computed values
2. Use stable keys for lists
3. Avoid inline object/array creation
4. Batch state updates

### Issue: Memory leaks

**Symptoms:**
- Memory usage grows over time
- Page becomes unresponsive
- Browser tab crashes

**Solutions:**
1. Clean up event listeners on unmount
2. Clear typing indicator timeouts
3. Limit message history in state
4. Remove stale WebSocket subscriptions

### Issue: Slow initial load

**Symptoms:**
- Long wait before messages appear
- Loading spinner for seconds
- Users complain about slowness

**Solutions:**
1. Reduce initial page size
2. Load messages progressively
3. Show skeleton UI immediately
4. Prefetch channel list

## 📊 Performance Monitoring

### Key Metrics to Track

```typescript
// Track message batch performance
const batchStart = Date.now()
flushMessageBatch()
const batchTime = Date.now() - batchStart
logger.debug(`Batch flush took ${batchTime}ms`)

// Track component render time
const renderStart = Date.now()
// ... render logic
const renderTime = Date.now() - renderStart
if (renderTime > 50) {
  logger.warn(`Slow render: ${renderTime}ms`)
}

// Track WebSocket message processing
ws.on('message', (msg) => {
  const start = Date.now()
  processMessage(msg)
  const duration = Date.now() - start
  if (duration > 100) {
    logger.warn(`Slow message processing: ${duration}ms`)
  }
})
```

### Alerting Thresholds

- **Critical**: Render time > 100ms
- **Warning**: Batch time > 50ms
- **Info**: Message processing > 20ms

## 🚀 Advanced Optimizations

### 1. Web Workers
Move heavy processing to Web Workers:
- Message parsing
- Link detection
- Emoji lookup
- Search indexing

### 2. IndexedDB
Cache message history locally:
- Faster initial load
- Offline support
- Reduced server load
- Better UX

### 3. Service Workers
Enable offline capabilities:
- Cache static assets
- Queue outgoing messages
- Background sync
- Push notifications

### 4. Code Splitting
Lazy load chat components:
```typescript
const ChannelChat = lazy(() => 
  import('./components/conference/chat/channel-chat')
)
```

### 5. Request Coalescing
Combine multiple API requests:
```typescript
// Instead of:
await ws.get('/channels/general/messages')
await ws.get('/channels/general/members')

// Do:
const [messages, members] = await Promise.all([
  ws.get('/channels/general/messages'),
  ws.get('/channels/general/members')
])
```

## 📈 Scaling Considerations

### Small Scale (< 100 users)
- Current optimizations sufficient
- Standard message batching
- No special caching needed

### Medium Scale (100-1000 users)
- Enable virtual scrolling
- Add message search index
- Implement read receipts
- Use Redis for presence

### Large Scale (1000+ users)
- Message sharding by channel
- Dedicated message queue
- Edge caching for static content
- CDN for media files
- Database replication

## 🔍 Profiling Tools

### Browser DevTools
```javascript
// Performance Timeline
performance.mark('message-start')
processMessage(msg)
performance.mark('message-end')
performance.measure('message', 'message-start', 'message-end')

// Memory Profiling
console.memory.usedJSHeapSize
```

### React DevTools
- Profiler tab: Record renders
- Components tab: Inspect props/state
- Console: Log render count

### Custom Metrics
```typescript
// Track message throughput
let messageCount = 0
setInterval(() => {
  logger.info(`Messages/sec: ${messageCount}`)
  messageCount = 0
}, 1000)

ws.on('message', () => messageCount++)
```

## ✅ Pre-Launch Checklist

### Performance
- [ ] Load time < 500ms
- [ ] 60 FPS scrolling
- [ ] No memory leaks
- [ ] Message batching working
- [ ] Pagination working

### Stability
- [ ] Error handling complete
- [ ] Loading states tracked
- [ ] WebSocket reconnection
- [ ] Duplicate request prevention
- [ ] Race condition handling

### User Experience
- [ ] Typing indicators smooth
- [ ] Auto-scroll working
- [ ] Private channels functional
- [ ] Load more button working
- [ ] Error messages helpful

### Code Quality
- [ ] All tests passing
- [ ] No console errors
- [ ] Code reviewed
- [ ] Documentation complete
- [ ] Types correct

## 📚 Further Reading

- [CHAT_OPTIMIZATION_SUMMARY.md](../../CHAT_OPTIMIZATION_SUMMARY.md) - Detailed optimization guide
- [README.md](./README.md) - Component documentation
- [Preact Performance](https://preactjs.com/guide/v10/performance)
- [WebSocket Optimization](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

---

**Remember**: Measure first, optimize second. Use real-world data to guide your optimizations.
