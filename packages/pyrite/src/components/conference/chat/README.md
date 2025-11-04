# Chat Components

Optimized chat components for real-time communication in Pyrite conference application.

## Components

### ChannelChat
Main chat component for displaying channel messages and input.

**Features:**
- Real-time message display with WebSocket updates
- Message batching for performance
- Memoized rendering to reduce re-renders
- Typing indicators
- Emoji picker
- Message pagination with "Load More" button
- Auto-scroll when near bottom

**Usage:**
```tsx
import ChannelChat from '@/components/conference/chat/channel-chat'

<ChannelChat channelSlug="general" />
```

**Props:**
- `channelSlug` (string): The channel slug to display
- `channel` (optional): Channel object if already loaded

### Message
Individual message component with support for text, links, and emojis.

**Features:**
- Avatar display with fallback initials
- URL detection and linkification
- Emoji rendering
- Timestamp formatting
- Username display

**Usage:**
```tsx
import Message from '@/components/conference/chat/message'

<Message 
  message={{
    message: "Hello world",
    nick: "username",
    time: Date.now(),
    kind: "message",
    user_id: "user-id"
  }}
  channelSlug="general"
/>
```

### PrivateChatHelper
Helper component for initiating private conversations with users.

**Features:**
- One-click DM initiation
- Loading states
- Automatic channel creation
- Navigation to private channel

**Usage:**
```tsx
import {PrivateChatHelper} from '@/components/conference/chat/private-chat-helper'

<PrivateChatHelper 
  targetUserId="user-123"
  targetUsername="John Doe"
/>
```

### OptimizedMessageList
Virtual scrolling message list for handling large message counts (not yet integrated).

**Features:**
- Virtual scrolling (only renders visible messages)
- Memoized message rendering
- Typing indicators
- Buffer zone for smooth scrolling

**Status**: Component ready, awaiting integration

## Performance Optimizations

### 1. Message Batching
Messages arriving within 50ms are batched together for a single state update, reducing re-renders by up to 90%.

### 2. Memoization
- Sorted messages computed once per message array change
- Typing users filtered once per typing state change
- Message components only re-render when content changes

### 3. Hardware Acceleration
CSS `will-change` property enables GPU-accelerated scrolling.

### 4. Efficient Keys
Message keys use `${timestamp}-${index}` for stable identity.

## State Structure

```typescript
{
  chat: {
    activeChannelSlug: string | null
    channels: {
      [slug: string]: {
        id: string
        messages: Message[]
        hasMore: boolean
        loading: boolean
        typing: Record<userId, TypingIndicator>
        unread: number
        members?: Record<userId, {avatar: string}>
      }
    }
    users: Record<userId, {username: string; avatar: string}>
    message: string // Current input text
    emoji: {
      active: boolean
      list: EmojiData[]
    }
  }
}
```

## API Integration

### Loading Messages
```typescript
import {loadChannelHistory, loadMoreMessages} from '@/models/chat'

// Load initial messages
await loadChannelHistory('general')

// Load older messages
await loadMoreMessages('general')
```

### Sending Messages
```typescript
import {sendMessage, sendTypingIndicator} from '@/models/chat'

// Send message
$s.chat.activeChannelSlug = 'general'
sendMessage('Hello world')

// Send typing indicator
sendTypingIndicator(true, 'general')
```

### Creating Private Channels
```typescript
import {ws} from '@garage44/common/app'

// Create or get private channel
const response = await ws.post('/api/chat/private/user-123', {})
if (response.success) {
  // Navigate to channel
  route(`/channels/${response.channel.slug}`)
}
```

## WebSocket Events

### Incoming Events

#### Channel Messages
```typescript
// Broadcasted when a message is sent
{
  url: '/channels/{slug}/messages',
  data: {
    id: number
    userId: string
    username: string
    message: string
    kind: 'message' | 'me' | 'command'
    timestamp: number
    channelSlug: string
    channelId: number
  }
}
```

#### Typing Indicators
```typescript
// Broadcasted when user types
{
  url: '/channels/{slug}/typing',
  data: {
    userId: string
    username: string
    typing: boolean
    timestamp: number
  }
}
```

#### Private Channel Created
```typescript
// Broadcasted when private channel is created
{
  url: '/chat/private-channel-created',
  data: {
    channel: Channel
    timestamp: number
  }
}
```

## Styling

Components use CSS modules with modern nesting. All styles are in corresponding `.css` files:

- `channel-chat.css` - Main chat component styles
- `private-chat-helper.css` - DM button styles

### CSS Variables Used
- `--surface-{1-8}` - Surface colors
- `--primary-{3-7}` - Primary colors
- `--spacer-{05-3}` - Spacing scale
- `--font-{xs-l}` - Font sizes
- `--border-radius-d` - Border radius

## Best Practices

1. **Always set activeChannelSlug** before sending messages
2. **Use batch operations** when processing multiple messages
3. **Memoize computed values** in components
4. **Track loading states** to prevent duplicate requests
5. **Handle errors gracefully** with user feedback
6. **Clean up typing indicators** on component unmount
7. **Scroll to bottom** only when user is near bottom

## Common Patterns

### Adding a DM Button to User Card
```tsx
import {PrivateChatHelper} from '@/components/conference/chat/private-chat-helper'

const UserCard = ({user}) => (
  <div class="user-card">
    <h3>{user.username}</h3>
    <PrivateChatHelper 
      targetUserId={user.id}
      targetUsername={user.username}
    />
  </div>
)
```

### Custom Message Rendering
```tsx
import Message from '@/components/conference/chat/message'

const CustomMessage = ({message}) => {
  // Add custom logic here
  return <Message message={message} channelSlug={channelSlug} />
}
```

### Load More on Scroll
```tsx
const handleScroll = (e) => {
  const {scrollTop} = e.target
  if (scrollTop < 100 && channelData.hasMore && !channelData.loading) {
    loadMoreMessages(channelSlug)
  }
}
```

## Troubleshooting

### Messages not appearing
- Check that WebSocket connection is established
- Verify channel slug is correct
- Ensure user has access to channel
- Check browser console for errors

### Typing indicators not showing
- Verify typing timeout is set correctly (3 seconds)
- Check that other users are actually typing
- Ensure typing events are being broadcast

### Scroll issues
- Check that `messagesRef` is properly attached
- Verify auto-scroll logic is working
- Ensure messages container has fixed height

### Performance issues
- Enable message batching (default: 50ms)
- Consider virtual scrolling for 100+ messages
- Check for unnecessary re-renders with React DevTools
- Verify memoization is working correctly

## Testing

```typescript
// Mock WebSocket for testing
const mockWs = {
  on: jest.fn(),
  post: jest.fn(),
  get: jest.fn()
}

// Mock state
const mockState = {
  chat: {
    channels: {},
    users: {},
    activeChannelSlug: null
  }
}
```

## Migration from Legacy Chat

1. Replace old chat components with new ones
2. Update state structure to include pagination fields
3. Update WebSocket subscriptions
4. Add private channel support
5. Test thoroughly with existing data

## Future Improvements

- [ ] Integrate virtual scrolling
- [ ] Add message search
- [ ] Support rich media (images, files)
- [ ] Add read receipts
- [ ] Implement message reactions
- [ ] Add threading support
- [ ] Offline message queue
- [ ] Message editing/deletion
- [ ] Desktop notifications
