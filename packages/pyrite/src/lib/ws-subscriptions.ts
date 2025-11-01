/**
 * WebSocket client subscriptions for real-time features
 * Uses Expressio's REST-like WebSocket API pattern (ws.post/get + ws.on for broadcasts)
 */

import {$s} from '@/app'
import {events, logger, ws} from '@garage44/common/app'

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
 * Chat WebSocket subscriptions
 * Listen for broadcasts from backend
 */
const initChatSubscriptions = () => {
    // Listen for incoming chat messages (broadcast from backend)
    events.on('app:init', () => {
        // Use onRoute for dynamic channel message broadcasts
        // Since URLs are dynamic (/channels/general/messages, /channels/dev/messages, etc.),
        // we use the generic message handler but with better pattern matching
        ws.on('message', (message) => {
            if (!message || !message.url) return

            // Check if this is a channel message broadcast
            // Match slug pattern (alphanumeric, hyphens, underscores)
            const messageUrlMatch = message.url.match(/^\/channels\/([a-zA-Z0-9_-]+)\/messages$/)
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

                // Find or create the chat channel (use slug as key)
                const channelKey = channelSlug
                if (!$s.chat.channels[channelKey]) {
                    $s.chat.channels[channelKey] = {
                        id: channelKey,
                        messages: [],
                        unread: 0,
                    }
                    logger.debug(`[Chat WS] Created channel entry for ${channelKey}`)
                }

                // Ensure user is in global users map for avatar lookup
                if (userId && username) {
                    if (!$s.chat.users) {
                        $s.chat.users = {}
                    }
                    // Get avatar from channel members if available, or use placeholder
                    const channel = $s.chat.channels[channelKey]
                    const memberAvatar = channel?.members?.[userId]?.avatar

                    if (!$s.chat.users[userId]) {
                        $s.chat.users[userId] = {
                            avatar: memberAvatar || 'placeholder-1.png',
                            username,
                        }
                    } else {
                        // Update username/avatar if they changed
                        $s.chat.users[userId].username = username
                        if (memberAvatar) {
                            $s.chat.users[userId].avatar = memberAvatar
                        }
                    }
                }

                // Add message to channel - DeepSignal will trigger reactivity
                const newMessage = {
                    kind: kind || 'message',
                    message: messageText,
                    nick: username,
                    time: timestamp || Date.now(),
                    user_id: userId, // Include user_id for avatar lookup
                }

                // Push to array - DeepSignal tracks array mutations
                $s.chat.channels[channelKey].messages.push(newMessage)

                logger.debug(`[Chat WS] Added message to channel ${channelKey}, total messages: ${$s.chat.channels[channelKey].messages.length}`)

                // Increment unread count if not the active channel
                if ($s.chat.activeChannelSlug !== channelSlug) {
                    $s.chat.channels[channelKey].unread++
                }
            }

            // Check if this is a typing indicator broadcast
            // Match slug pattern (alphanumeric, hyphens, underscores)
            const typingUrlMatch = message.url.match(/^\/channels\/([a-zA-Z0-9_-]+)\/typing$/)
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
            const currentGroup = $s.groups.find((g) => g.name === groupId)
            if (currentGroup) {
                currentGroup.clientCount = (currentGroup.clientCount || 0) + 1
            }

            // If this is the current group, add user to users list
            if ($s.group.name === groupId) {
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
            const currentGroup = $s.groups.find((g) => g.name === groupId)
            if (currentGroup && currentGroup.clientCount > 0) {
                currentGroup.clientCount = currentGroup.clientCount - 1
            }

            // If this is the current group, remove user from users list
            if ($s.group.name === groupId) {
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

            const group = $s.groups.find((g) => g.name === groupId)
            if (group) {
                group.locked = locked
            }

            // If this is the current group, update state
            if ($s.group.name === groupId) {
                $s.group.locked = locked
            }
        })

        // Recording status changed (broadcast from backend)
        ws.on('/groups/:groupId/recording', (data) => {
            const {recording, recordingId, timestamp} = data
            const groupId = data.groupId

            logger.debug(`Group ${groupId} recording status: ${recording}`)

            // Update current group recording state
            if ($s.group.name === groupId) {
                $s.group.recording = recording
            }
        })

        // Group configuration updated (broadcast from backend)
        ws.on('/groups/:groupId/config', (data) => {
            const {config, timestamp} = data
            const groupId = data.groupId

            logger.debug(`Group ${groupId} config updated`)

            const group = $s.groups.find((g) => g.name === groupId)
            if (group) {
                Object.assign(group, config)
            }
        })

        // Group created or deleted (broadcast from backend)
        ws.on('/groups/update', (data) => {
            const {action, group, groupId, timestamp} = data

            logger.debug(`Group ${groupId} ${action}`)

            if (action === 'created' && group) {
                // Add new group to list
                const existingGroup = $s.groups.find((g) => g.name === groupId)
                if (!existingGroup) {
                    $s.groups.push(group)
                }
            } else if (action === 'deleted') {
                // Remove group from list
                const groupIndex = $s.groups.findIndex((g) => g.name === groupId)
                if (groupIndex !== -1) {
                    $s.groups.splice(groupIndex, 1)
                }
            }
        })

        // Operator action (broadcast from backend)
        ws.on('/groups/:groupId/op-action', (data) => {
            const {action, actionData, targetUserId, timestamp} = data
            const groupId = data.groupId

            if ($s.group.name !== groupId) return

            logger.debug(`Operator action in group ${groupId}: ${action}`)

            const targetUser = $s.users.find((u) => u.id === targetUserId)

            switch (action) {
                case 'kick':
                    // Remove kicked user
                    if (targetUserId === $s.profile.id) {
                        // Current user was kicked, disconnect
                        $s.group.connected = false
                        $s.group.name = ''
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
    if (!$s.group.name) return

    ws.post(`/api/chat/${$s.group.name}/message`, {
        kind,
        message,
        nick: $s.profile.username,
    })
}

/**
 * Send typing indicator
 */
export const sendTypingIndicator = (typing: boolean) => {
    if (!$s.group.name || !$s.profile.id) return

    ws.post(`/api/chat/${$s.group.name}/typing`, {
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
