import {$s} from '@/app'
import {events, notifier, ws} from '@garage44/common/app'
import {logger} from '@garage44/common/lib/logger'

export function _events() {
    // Implement reactivity for panels.chat collapsed state
    // When chat panel is opened, clear unread count

    events.on('channel', ({action, channelId, channel = null}) => {
        logger.debug('switch chat channel to ', channelId)
        if (action === 'switch') {
            if (!$s.chat.channels[channelId]) {
                $s.chat.channels[channelId] = channel
            }

            selectChannel(channelId)
        }
    })

    events.on('disconnected', () => {
        $s.chat.channels.main.messages = []
        $s.chat.channels.main.unread = 0
    })

    // User left; clean up the channel.
    events.on('user', ({action, user}) => {
        if (action === 'del' && $s.chat.channels[user.id]) {
            // Change the active to-be-deleted channel to main
            if ($s.chat.channel === user.id) {
                selectChannel('main')
            }
            delete $s.chat.channels[user.id]
        }
    })
}

export function closeChannel(channel) {
    selectChannel('main')
    delete $s.chat.channels[channel.id]
}

export function clearChat() {
    logger.debug('clearing chat from remote')
    $s.chat.channels.main.messages = []
}

/**
 * Galene SFU message handler
 * @param {*} sourceId
 * @param {*} destinationId
 * @param {*} nick
 * @param {*} time
 * @param {*} privileged
 * @param {*} history
 * @param {*} kind
 * @param {*} message
 */
export async function onMessage(messageData: {
    sourceId: string
    destinationId: string
    nick: string
    time: number
    privileged: boolean
    history: boolean
    kind: string
    message: string
}) {
    const {sourceId, destinationId, nick, time, privileged, history, kind: messageKind, message} = messageData
    const kind = messageKind || 'default'
    let channelId
    // Incoming message for the main channel
    if (!destinationId) {
        channelId = 'main'
        $s.chat.channels.main.messages.push({kind, message, nick, time})
    }
    // This is a private message
    else if (destinationId && sourceId) {
        channelId = sourceId
        const activeUser = $s.users.find((user) => user.id === sourceId)
        if (activeUser) {
            if (!$s.chat.channels[sourceId]) {
                $s.chat.channels[sourceId] = {
                    id: sourceId,
                    messages: [],
                    name: nick,
                    unread: 0,
                }
            }

            $s.chat.channels[sourceId].messages.push({kind, message, nick, time})
        }
    }

    // Notifies user of a new message when the active channel
    // is not visible, because the chat panel is closed or a different
    // channel is active. Not that the chat history is also replayed through
    // onMessage. This is why no chat channel is selected initially;
    // we don't want to show those messages while entering the group.
    if (
        $s.chat.channels[$s.chat.channel] &&
        ((channelId !== $s.chat.channel) || $s.panels.chat.collapsed)
    ) {
        $s.chat.channels[channelId].unread += 1
    }

}

export const emojiLookup = new Set()

export function selectChannel(channelSlug: string | number) {
    // channelSlug can be a channel slug (string) or a legacy numeric ID (for backward compatibility during migration)
    // For non-channel chat (e.g., 'main', user IDs), treat as string
    if (typeof channelSlug === 'string') {
        // Check if it's a Pyrite channel slug (by checking if it exists in channels)
        const channel = $s.channels.find(c => c.slug === channelSlug)
        if (channel) {
            $s.chat.activeChannelSlug = channelSlug
            $s.chat.channel = channelSlug
            // Load channel history
            loadChannelHistory(channelSlug)
        } else {
            // Legacy chat channel (e.g., 'main', user IDs)
            $s.chat.activeChannelSlug = null
            $s.chat.channel = channelSlug
        }
    } else {
        // Legacy numeric ID (during migration)
        $s.chat.activeChannelSlug = null
        $s.chat.channel = channelSlug.toString()
        loadChannelHistory(channelSlug)
    }

    // Clear unread count for the selected channel
    if ($s.chat.channels[$s.chat.channel]) {
        $s.chat.channels[$s.chat.channel].unread = 0
    }
}

// Track ongoing load requests to prevent duplicates
const loadingChannels = new Set<string | number>()

/**
 * Load all users globally from all accessible channels
 */
export async function loadGlobalUsers() {
    try {
        if (!$s.channels.length) return

        // Initialize global users map if needed
        if (!$s.chat.users) {
            $s.chat.users = {}
        }

        // Load members from all channels
        for (const channel of $s.channels) {
            const membersResponse = await ws.get(`/channels/${channel.slug}/members`)
            if (membersResponse && membersResponse.success && membersResponse.members) {
                for (const member of membersResponse.members) {
                    // Store user globally: userId -> {username, avatar}
                    if (!$s.chat.users[member.user_id]) {
                        $s.chat.users[member.user_id] = {
                            username: member.username,
                            avatar: member.avatar,
                        }
                    }
                    // Update if exists (in case avatar changed)
                    else {
                        $s.chat.users[member.user_id].avatar = member.avatar
                        $s.chat.users[member.user_id].username = member.username
                    }
                }
            }
        }
    } catch (error) {
        logger.error('[Chat] Error loading global users:', error)
    }
}

/**
 * Load channel history with pagination support
 * @param channelSlug Channel slug
 * @param before Load messages before this timestamp (for pagination)
 * @param limit Number of messages to load
 */
export async function loadChannelHistory(
    channelSlug: string | number,
    before?: number,
    limit: number = 50
) {
    // Prevent duplicate requests for the same channel
    const loadKey = `${channelSlug}-${before || 'initial'}`
    if (loadingChannels.has(loadKey)) {
        logger.debug(`[Chat] Already loading history for channel ${channelSlug}`)
        return
    }

    try {
        loadingChannels.add(loadKey)
        const channelKey = channelSlug.toString()

        // Pre-create channel entry if it doesn't exist for immediate UI feedback
        if (!$s.chat.channels[channelKey]) {
            $s.chat.channels[channelKey] = {
                hasMore: false,
                id: channelKey,
                loading: true,
                messages: [],
                typing: {},
                unread: 0,
            }
        } else {
            $s.chat.channels[channelKey].loading = true
        }

        logger.debug(`[Chat] Loading history for channel ${channelSlug}`, {before, limit})

        // Load channel members first to get avatars (only on initial load)
        if (!before) {
            const membersResponse = await ws.get(`/channels/${channelSlug}/members`)
            const members: Record<string, {avatar: string}> = {}

            if (membersResponse && membersResponse.success && membersResponse.members) {
                for (const member of membersResponse.members) {
                    members[member.user_id] = {avatar: member.avatar}

                    // Also update global users
                    if (!$s.chat.users) {
                        $s.chat.users = {}
                    }
                    $s.chat.users[member.user_id] = {
                        avatar: member.avatar,
                        username: member.username,
                    }
                }

                // Store members for avatar lookup
                if (!$s.chat.channels[channelKey].members) {
                    $s.chat.channels[channelKey].members = {}
                }
                Object.assign($s.chat.channels[channelKey].members, members)
            }
        }

        // Load messages with pagination
        const response = await ws.get(`/channels/${channelSlug}/messages`, {before, limit})

        if (response && response.success && response.messages) {
            // Transform database message format to frontend format
            // DB format: {id, channel_id, user_id, username, message, timestamp, kind}
            // Frontend format: {kind, message, nick, time, user_id}
            const transformedMessages = response.messages.map((msg: any) => ({
                kind: msg.kind || 'message',
                message: msg.message,
                nick: msg.username,
                time: msg.timestamp,
                user_id: msg.user_id,
            }))

            logger.debug(`[Chat] Loaded ${transformedMessages.length} messages for channel ${channelSlug}`)

            if (before) {
                // Prepend older messages to the beginning
                $s.chat.channels[channelKey].messages.unshift(...transformedMessages)
            } else {
                // Replace with initial messages
                $s.chat.channels[channelKey].messages = transformedMessages
            }

            // Update pagination info
            $s.chat.channels[channelKey].hasMore = response.hasMore || false
            $s.chat.channels[channelKey].loading = false
        } else {
            logger.warn(`[Chat] No messages in response for channel ${channelSlug}:`, response)
            $s.chat.channels[channelKey].loading = false
        }
    } catch (error) {
        logger.error('[Chat] Error loading channel history:', error)
        const channelKey = channelSlug.toString()
        if ($s.chat.channels[channelKey]) {
            $s.chat.channels[channelKey].loading = false
        }
    } finally {
        loadingChannels.delete(loadKey)
    }
}

/**
 * Load more (older) messages for a channel
 */
export async function loadMoreMessages(channelSlug: string) {
    const channelKey = channelSlug
    const channel = $s.chat.channels[channelKey]

    if (!channel || !channel.hasMore || channel.loading) {
        return
    }

    // Get timestamp of oldest message
    const oldestMessage = channel.messages[0]
    if (!oldestMessage) return

    await loadChannelHistory(channelSlug, oldestMessage.time, 50)
}

/**
 * Send typing indicator for current channel
 */
export async function sendTypingIndicator(typing: boolean, channelSlug?: string) {
    const targetChannelSlug = channelSlug || $s.chat.activeChannelSlug
    if (!targetChannelSlug) return

    try {
        await ws.post(`/channels/${targetChannelSlug}/typing`, {
            typing,
        })
    } catch (error) {
        logger.debug('[Chat] Error sending typing indicator:', error)
        // Don't notify user - this is a background operation
    }
}

export async function sendMessage(message: string) {
    if (!$s.chat.activeChannelSlug) {
        notifier.notify({
            level: 'error',
            message: 'No channel selected'
        })
        return
    }

    // Stop typing indicator when message is sent
    await sendTypingIndicator(false, $s.chat.activeChannelSlug)

    const isCommand = message[0] === '/'
    let kind = 'message'

    if (isCommand) {
        if (message.length > 1 && message[1] === '/') {
            message = message.slice(1)
            kind = 'message'
        } else {
            let cmd, rest
            let space = message.indexOf(' ')
            if (space < 0) {
                cmd = message.slice(1)
                rest = ''
            } else {
                cmd = message.slice(1, space)
                rest = message.slice(space + 1)
            }

            if (cmd === 'me') {
                message = rest
                kind = 'me'
            } else {
                notifier.notify({
                    level: 'error',
                    message: `Unknown command /${cmd}, type /help for help`,
                })
                return
            }
        }
    }

    try {
        const response = await ws.post(`/channels/${$s.chat.activeChannelSlug}/messages`, {
            message,
            kind
        })

        if (!response.success) {
            notifier.notify({
                level: 'error',
                message: response.error || 'Failed to send message'
            })
        }
    } catch (error) {
        logger.error('[Chat] Error sending message:', error)
        notifier.notify({
            level: 'error',
            message: 'Failed to send message'
        })
    }
}

export function unreadMessages() {
    let unread = 0

    for (const channel of Object.values($s.chat.channels)) {
        unread += channel.unread
    }
    return unread
}
