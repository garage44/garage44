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

export function selectChannel(channelId: number | string) {
    if (typeof channelId === 'number') {
        $s.chat.activeChannelId = channelId
        $s.chat.channel = channelId.toString()
    } else {
        $s.chat.activeChannelId = null
        $s.chat.channel = channelId
    }

    // Clear unread count for the selected channel
    if ($s.chat.channels[$s.chat.channel]) {
        $s.chat.channels[$s.chat.channel].unread = 0
    }

    // Load channel history if not already loaded
    if (typeof channelId === 'number') {
        loadChannelHistory(channelId)
    }
}

// Track ongoing load requests to prevent duplicates
const loadingChannels = new Set<number>()

export async function loadChannelHistory(channelId: number) {
    // Prevent duplicate requests for the same channel
    if (loadingChannels.has(channelId)) {
        logger.debug(`[Chat] Already loading history for channel ${channelId}`)
        return
    }

    try {
        loadingChannels.add(channelId)
        const channelKey = channelId.toString()

        // Pre-create channel entry if it doesn't exist for immediate UI feedback
        if (!$s.chat.channels[channelKey]) {
            $s.chat.channels[channelKey] = {
                id: channelKey,
                messages: [],
                unread: 0
            }
        }

        logger.debug(`[Chat] Loading history for channel ${channelId}`)
        const response = await ws.get(`/channels/${channelId}/messages`)

        if (response && response.success && response.messages) {
            // Transform database message format to frontend format
            // DB format: {id, channel_id, user_id, username, message, timestamp, kind}
            // Frontend format: {kind, message, nick, time}
            const transformedMessages = response.messages.map((msg: any) => ({
                kind: msg.kind || 'message',
                message: msg.message,
                nick: msg.username,
                time: msg.timestamp,
            }))

            logger.debug(`[Chat] Loaded ${transformedMessages.length} messages for channel ${channelId}`)

            // Assign entire array to trigger DeepSignal reactivity
            $s.chat.channels[channelKey].messages = transformedMessages
        } else {
            logger.warn(`[Chat] No messages in response for channel ${channelId}:`, response)
        }
    } catch (error) {
        logger.error('[Chat] Error loading channel history:', error)
    } finally {
        loadingChannels.delete(channelId)
    }
}

/**
 * Send typing indicator for current channel
 */
export async function sendTypingIndicator(typing: boolean, channelId?: number) {
    const targetChannelId = channelId || $s.chat.activeChannelId
    if (!targetChannelId) return

    try {
        await ws.post(`/channels/${targetChannelId}/typing`, {
            typing,
        })
    } catch (error) {
        logger.debug('[Chat] Error sending typing indicator:', error)
        // Don't notify user - this is a background operation
    }
}

export async function sendMessage(message: string) {
    if (!$s.chat.activeChannelId) {
        notifier.notify({
            level: 'error',
            message: 'No channel selected'
        })
        return
    }

    // Stop typing indicator when message is sent
    await sendTypingIndicator(false, $s.chat.activeChannelId)

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
        const response = await ws.post(`/channels/${$s.chat.activeChannelId}/messages`, {
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
