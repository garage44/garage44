/**
 * WebSocket client subscriptions for real-time features
 * Uses Expressio's REST-like WebSocket API pattern (ws.post/get + ws.on for broadcasts)
 * Optimized for performance with message batching and efficient pattern matching
 */

import {$s} from '@/app'
import {events, logger, ws} from '@garage44/common/app'

// Message batching for performance
const messageBatchQueue = new Map<string, any[]>()
let messageBatchTimer: NodeJS.Timeout | null = null
const MESSAGE_BATCH_DELAY = 50 // ms - batch messages within 50ms window

// Pre-compile regex patterns for better performance
const MESSAGE_URL_PATTERN = /^\/channels\/([a-zA-Z0-9_-]+)\/messages$/
const TYPING_URL_PATTERN = /^\/channels\/([a-zA-Z0-9_-]+)\/typing$/

/**
 * Initialize all WebSocket subscriptions
 * Called after WebSocket connection is established
 */
export const initWebSocketSubscriptions = () => {
    logger.info('Initializing WebSocket subscriptions')

    // Listen for broadcasts from backend
    initChatSubscriptions()
    initPresenceSubscriptions()
    initGroupSubscriptions()

    logger.info('WebSocket subscriptions initialized')
}

/**
 * Flush batched messages to state
 * Reduces state updates by batching multiple messages into single update
 */
const flushMessageBatch = () => {
    if (messageBatchQueue.size === 0) return

    // Process all batched messages
    for (const [channelKey, messages] of messageBatchQueue.entries()) {
        if (messages.length === 0) continue

        // Ensure channel exists
        if (!$s.chat.channels[channelKey]) {
            $s.chat.channels[channelKey] = {
                id: channelKey,
                messages: [],
                typing: {},
                unread: 0,
            }
        }

        // Batch append all messages at once - single state update
        $s.chat.channels[channelKey].messages.push(...messages)

        logger.debug(`[Chat WS] Flushed ${messages.length} messages to channel ${channelKey}`)

        // Update unread count if not active channel
        if ($s.chat.activeChannelSlug !== channelKey) {
            $s.chat.channels[channelKey].unread += messages.length
        }
    }

    // Clear batch queue
    messageBatchQueue.clear()
    messageBatchTimer = null
}

/**
 * Add message to batch queue
 * Messages are batched and flushed together for better performance
 */
const batchMessage = (channelKey: string, message: any) => {
    if (!messageBatchQueue.has(channelKey)) {
        messageBatchQueue.set(channelKey, [])
    }
    messageBatchQueue.get(channelKey)!.push(message)

    // Schedule flush if not already scheduled
    if (!messageBatchTimer) {
        messageBatchTimer = setTimeout(flushMessageBatch, MESSAGE_BATCH_DELAY)
    }
}

/**
 * Chat WebSocket subscriptions
 * Listen for broadcasts from backend
 * Optimized with message batching and pre-compiled regex
 */
const initChatSubscriptions = () => {
    // Listen for private channel creation
    events.on('app:init', () => {
        ws.on('/chat/private-channel-created', (data) => {
            const {channel} = data
            
            if (!channel) return

            logger.debug('[Chat WS] Private channel created:', channel)

            // Add channel to channels list if not already there
            if (!$s.channels.find(c => c.id === channel.id)) {
                $s.channels.push(channel)
            }

            // Notify user
            // (Optional: Can add a notification here)
        })
    })
    // Listen for incoming chat messages (broadcast from backend)
    events.on('app:init', () => {
        // Use onRoute for dynamic channel message broadcasts
        // Since URLs are dynamic (/channels/general/messages, /channels/dev/messages, etc.),
        // we use the generic message handler but with better pattern matching
        ws.on('message', (message) => {
            if (!message || !message.url) return

            // Check if this is a channel message broadcast
            // Use pre-compiled regex for better performance
            const messageUrlMatch = message.url.match(MESSAGE_URL_PATTERN)
            if (messageUrlMatch) {
                const channelSlug = messageUrlMatch[1]
                const data = message.data

                if (!data || !channelSlug) {
                    logger.warn('[Chat WS] Invalid message data:', message)
                    return
                }

                const {kind, message: messageText, timestamp, userId, username} = data

                if (!messageText || !username) {
                    logger.warn('[Chat WS] Missing required message fields:', data)
                    return
                }

                logger.debug(`[Chat WS] Received message for channel ${channelSlug}:`, {messageText, username})

                // Ensure global users map exists
                if (!$s.chat.users) {
                    $s.chat.users = {}
                }

                // Update user info if provided
                if (userId && username && !$s.chat.users[userId]) {
                    $s.chat.users[userId] = {
                        avatar: 'placeholder-1.png',
                        username,
                    }
                }

                // Create message object
                const newMessage = {
                    kind: kind || 'message',
                    message: messageText,
                    nick: username,
                    time: timestamp || Date.now(),
                    user_id: userId,
                }

                // Batch message instead of adding immediately
                // This reduces re-renders when multiple messages arrive quickly
                batchMessage(channelSlug, newMessage)
            }

            // Check if this is a typing indicator broadcast
            // Use pre-compiled regex for better performance
            const typingUrlMatch = message.url.match(TYPING_URL_PATTERN)
            if (typingUrlMatch) {
                const channelSlug = typingUrlMatch[1]
                const data = message.data
                const {typing, userId, username} = data || {}

                if (userId) {
                    const channelKey = channelSlug

                    // Ensure channel exists
                    if (!$s.chat.channels[channelKey]) {
                        $s.chat.channels[channelKey] = {
                            id: channelKey,
                            messages: [],
                            typing: {},
                            unread: 0,
                        }
                    } else if (!$s.chat.channels[channelKey].typing) {
                        $s.chat.channels[channelKey].typing = {}
                    }

                    // Update typing state for this user in this channel
                    if (typing) {
                        $s.chat.channels[channelKey].typing[userId] = {
                            timestamp: Date.now(),
                            userId,
                            username: username || 'Unknown',
                        }
                    } else {
                        // Remove typing indicator when user stops typing
                        delete $s.chat.channels[channelKey].typing[userId]
                    }
                }
            }
        })
    })
}

/**
 * Presence WebSocket subscriptions
 * Listen for broadcasts from backend
 */
const initPresenceSubscriptions = () => {
    events.on('app:init', () => {
        // User joined group (broadcast from backend)
        ws.on('/presence/:groupId/join', (data) => {
            const {groupId, timestamp, userId, username} = data

            logger.debug(`User ${username} joined group ${groupId}`)

            // Update current group member count if relevant
            if ($s.sfu.channels[groupId]) {
                $s.sfu.channels[groupId].clientCount = ($s.sfu.channels[groupId].clientCount || 0) + 1
            }

            // If this is the current group, add user to users list
            if ($s.sfu.channel.name === groupId) {
                const existingUser = $s.users.find((u) => u.id === userId)
                if (!existingUser) {
                    $s.users.push({
                        data: {
                            availability: {id: 'available'},
                            mic: true,
                            raisehand: false,
                        },
                        id: userId,
                        permissions: {
                            op: false,
                            present: false,
                            record: false,
                        },
                        username,
                    })
                }
            }
        })

        // User left group (broadcast from backend)
        ws.on('/presence/:groupId/leave', (data) => {
            const {groupId, timestamp, userId} = data

            logger.debug(`User ${userId} left group ${groupId}`)

            // Update current group member count if relevant
            if ($s.sfu.channels[groupId] && ($s.sfu.channels[groupId].clientCount || 0) > 0) {
                $s.sfu.channels[groupId].clientCount = ($s.sfu.channels[groupId].clientCount || 0) - 1
            }

            // If this is the current group, remove user from users list
            if ($s.sfu.channel.name === groupId) {
                const userIndex = $s.users.findIndex((u) => u.id === userId)
                if (userIndex !== -1) {
                    $s.users.splice(userIndex, 1)
                }
            }
        })

        // User status update (broadcast from backend)
        ws.on('/presence/:groupId/status', (data) => {
            const {status, timestamp, userId} = data

            const user = $s.users.find((u) => u.id === userId)
            if (user) {
                Object.assign(user.data, status)
            }
        })
    })
}

/**
 * Group state WebSocket subscriptions
 * Listen for broadcasts from backend
 */
const initGroupSubscriptions = () => {
    events.on('app:init', () => {
        // Group lock status changed (broadcast from backend)
        ws.on('/groups/:groupId/lock', (data) => {
            const {locked, reason, timestamp} = data
            const groupId = data.groupId // Extracted from broadcast

            logger.debug(`Group ${groupId} lock status: ${locked}`)

            // Update channel data
            if ($s.sfu.channels[groupId]) {
                $s.sfu.channels[groupId].locked = locked
            }

            // If this is the current group, update state
            if ($s.sfu.channel.name === groupId) {
                $s.sfu.channel.locked = locked
            }
        })

        // Recording status changed (broadcast from backend)
        ws.on('/groups/:groupId/recording', (data) => {
            const {recording, recordingId, timestamp} = data
            const groupId = data.groupId

            logger.debug(`Group ${groupId} recording status: ${recording}`)

            // Update current group recording state
            if ($s.sfu.channel.name === groupId) {
                $s.sfu.channel.recording = recording
            }
        })

        // Group configuration updated (broadcast from backend)
        ws.on('/groups/:groupId/config', (data) => {
            const {config, timestamp} = data
            const groupId = data.groupId

            logger.debug(`Group ${groupId} config updated`)

            // Update channel data
            if ($s.sfu.channels[groupId]) {
                Object.assign($s.sfu.channels[groupId], config)
            }
        })

        // Group created or deleted (broadcast from backend)
        ws.on('/groups/update', (data) => {
            const {action, group, groupId, timestamp} = data

            logger.debug(`Group ${groupId} ${action}`)

            if (action === 'created' && group) {
                // Add new group to channels if it doesn't exist
                if (!$s.sfu.channels[groupId]) {
                    $s.sfu.channels[groupId] = {
                        audio: false,
                        connected: false,
                        video: false,
                    }
                }
                // Update group metadata
                Object.assign($s.sfu.channels[groupId], {
                    locked: group.locked,
                    clientCount: group.clientCount,
                    comment: group.comment,
                    description: group.description,
                })
            } else if (action === 'deleted') {
                // Note: We don't delete from sfu.channels to preserve audio/video state
                // Only clear group metadata, keep audio/video preferences
                if ($s.sfu.channels[groupId]) {
                    delete $s.sfu.channels[groupId].locked
                    delete $s.sfu.channels[groupId].clientCount
                    delete $s.sfu.channels[groupId].comment
                    delete $s.sfu.channels[groupId].description
                }
            }
        })

        // Operator action (broadcast from backend)
        ws.on('/groups/:groupId/op-action', (data) => {
            const {action, actionData, targetUserId, timestamp} = data
            const groupId = data.groupId

            if ($s.sfu.channel.name !== groupId) return

            logger.debug(`Operator action in group ${groupId}: ${action}`)

            const targetUser = $s.users.find((u) => u.id === targetUserId)

            switch (action) {
                case 'kick':
                    // Remove kicked user
                    if (targetUserId === $s.profile.id) {
                        // Current user was kicked, disconnect
                        const channelSlug = $s.sfu.channel.name || $s.chat.activeChannelSlug
                        $s.sfu.channel.connected = false
                        $s.sfu.channel.name = ''

                        // Update channel connection state
                        if (channelSlug && $s.sfu.channels[channelSlug]) {
                            $s.sfu.channels[channelSlug].connected = false
                        }
                    } else if (targetUser) {
                        // Another user was kicked
                        const userIndex = $s.users.findIndex((u) => u.id === targetUserId)
                        if (userIndex !== -1) {
                            $s.users.splice(userIndex, 1)
                        }
                    }
                    break

                case 'mute':
                    // Mute user's microphone
                    if (targetUserId === $s.profile.id) {
                        $s.devices.mic.enabled = false
                    } else if (targetUser) {
                        targetUser.data.mic = false
                    }
                    break

                case 'op':
                case 'unop':
                    // Update operator permissions
                    if (targetUser) {
                        targetUser.permissions.op = (action === 'op')
                    }
                    if (targetUserId === $s.profile.id) {
                        $s.permissions.op = (action === 'op')
                    }
                    break

                case 'present':
                case 'unpresent':
                    // Update presenter permissions
                    if (targetUser) {
                        targetUser.permissions.present = (action === 'present')
                    }
                    if (targetUserId === $s.profile.id) {
                        $s.permissions.present = (action === 'present')
                    }
                    break
            }
        })
    })
}

/**
 * Send chat message via WebSocket (using REST-like API)
 */
export const sendChatMessage = (message: string, kind: string = 'message') => {
    if (!$s.sfu.channel.name) return

    ws.post(`/api/chat/${$s.sfu.channel.name}/message`, {
        kind,
        message,
        nick: $s.profile.username,
    })
}

/**
 * Send typing indicator
 */
export const sendTypingIndicator = (typing: boolean) => {
    if (!$s.sfu.channel.name || !$s.profile.id) return

    ws.post(`/api/chat/${$s.sfu.channel.name}/typing`, {
        typing,
        userId: $s.profile.id,
    })
}

/**
 * Join a group (announce presence)
 */
export const joinGroup = async (groupId: string) => {
    if (!$s.profile.id || !$s.profile.username) return

    const response = await ws.post(`/api/presence/${groupId}/join`, {
        userId: $s.profile.id,
        username: $s.profile.username,
    })

    // Response contains current members list
    if (response && response.members) {
        // Update users list with current members
        for (const member of response.members) {
            const existingUser = $s.users.find((u) => u.id === member.id)
            if (!existingUser) {
                $s.users.push({
                    data: {
                        availability: {id: 'available'},
                        mic: true,
                        raisehand: false,
                    },
                    id: member.id,
                    permissions: {
                        op: false,
                        present: false,
                        record: false,
                    },
                    username: member.username,
                })
            }
        }
    }
}

/**
 * Leave a group (remove presence)
 */
export const leaveGroup = (groupId: string) => {
    if (!$s.profile.id) return

    ws.post(`/api/presence/${groupId}/leave`, {
        userId: $s.profile.id,
    })
}

/**
 * Query presence for a group
 */
export const queryGroupPresence = async (groupId: string) => {
    const response = await ws.get(`/api/presence/${groupId}/members`, {})
    return response?.members || []
}
