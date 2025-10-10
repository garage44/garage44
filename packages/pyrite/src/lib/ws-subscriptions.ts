/**
 * WebSocket client subscriptions for real-time features
 * Uses Expressio's REST-like WebSocket API pattern (ws.post/get + ws.on for broadcasts)
 */

import {$s, ws} from '@/app'
import {events, logger} from '@garage44/common/app'

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
        ws.on('/chat/:groupId/message', (data) => {
            const {groupId, message, nick, kind, timestamp} = data

            // Only process messages for the current group
            if ($s.group.name !== groupId) return

            // Find or create the chat channel
            const channelId = kind === 'me' ? 'main' : nick
            if (!$s.chat.channels[channelId]) {
                $s.chat.channels[channelId] = {
                    id: channelId,
                    messages: [],
                    name: nick,
                    unread: 0,
                }
            }

            // Add message to channel
            $s.chat.channels[channelId].messages.push({
                kind,
                message,
                nick,
                time: timestamp,
            })

            // Increment unread count if not the active channel
            if ($s.chat.channel !== channelId) {
                $s.chat.channels[channelId].unread++
            }
        })

        // Listen for typing indicators (broadcast from backend)
        ws.on('/chat/:groupId/typing', (data) => {
            const {userId, typing} = data

            if ($s.group.name !== data.groupId) return

            // Update user typing state
            const user = $s.users.find(u => u.id === userId)
            if (user) {
                user.typing = typing
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
            const {groupId, userId, username, timestamp} = data

            logger.debug(`User ${username} joined group ${groupId}`)

            // Update current group member count if relevant
            const currentGroup = $s.groups.find(g => g.name === groupId)
            if (currentGroup) {
                currentGroup.clientCount = (currentGroup.clientCount || 0) + 1
            }

            // If this is the current group, add user to users list
            if ($s.group.name === groupId) {
                const existingUser = $s.users.find(u => u.id === userId)
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
            const {groupId, userId, timestamp} = data

            logger.debug(`User ${userId} left group ${groupId}`)

            // Update current group member count if relevant
            const currentGroup = $s.groups.find(g => g.name === groupId)
            if (currentGroup && currentGroup.clientCount > 0) {
                currentGroup.clientCount = currentGroup.clientCount - 1
            }

            // If this is the current group, remove user from users list
            if ($s.group.name === groupId) {
                const userIndex = $s.users.findIndex(u => u.id === userId)
                if (userIndex !== -1) {
                    $s.users.splice(userIndex, 1)
                }
            }
        })

        // User status update (broadcast from backend)
        ws.on('/presence/:groupId/status', (data) => {
            const {userId, status, timestamp} = data

            const user = $s.users.find(u => u.id === userId)
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

            const group = $s.groups.find(g => g.name === groupId)
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

            const group = $s.groups.find(g => g.name === groupId)
            if (group) {
                Object.assign(group, config)
            }
        })

        // Group created or deleted (broadcast from backend)
        ws.on('/groups/update', (data) => {
            const {groupId, action, group, timestamp} = data

            logger.debug(`Group ${groupId} ${action}`)

            if (action === 'created' && group) {
                // Add new group to list
                const existingGroup = $s.groups.find(g => g.name === groupId)
                if (!existingGroup) {
                    $s.groups.push(group)
                }
            } else if (action === 'deleted') {
                // Remove group from list
                const groupIndex = $s.groups.findIndex(g => g.name === groupId)
                if (groupIndex !== -1) {
                    $s.groups.splice(groupIndex, 1)
                }
            }
        })

        // Operator action (broadcast from backend)
        ws.on('/groups/:groupId/op-action', (data) => {
            const {action, targetUserId, actionData, timestamp} = data
            const groupId = data.groupId

            if ($s.group.name !== groupId) return

            logger.debug(`Operator action in group ${groupId}: ${action}`)

            const targetUser = $s.users.find(u => u.id === targetUserId)

            switch (action) {
                case 'kick':
                    // Remove kicked user
                    if (targetUserId === $s.user.id) {
                        // Current user was kicked, disconnect
                        $s.group.connected = false
                        $s.group.name = ''
                    } else if (targetUser) {
                        // Another user was kicked
                        const userIndex = $s.users.findIndex(u => u.id === targetUserId)
                        if (userIndex !== -1) {
                            $s.users.splice(userIndex, 1)
                        }
                    }
                    break

                case 'mute':
                    // Mute user's microphone
                    if (targetUserId === $s.user.id) {
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
                    if (targetUserId === $s.user.id) {
                        $s.permissions.op = (action === 'op')
                    }
                    break

                case 'present':
                case 'unpresent':
                    // Update presenter permissions
                    if (targetUser) {
                        targetUser.permissions.present = (action === 'present')
                    }
                    if (targetUserId === $s.user.id) {
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
        nick: $s.user.username,
    })
}

/**
 * Send typing indicator
 */
export const sendTypingIndicator = (typing: boolean) => {
    if (!$s.group.name || !$s.user.id) return

    ws.post(`/api/chat/${$s.group.name}/typing`, {
        typing,
        userId: $s.user.id,
    })
}

/**
 * Join a group (announce presence)
 */
export const joinGroup = async (groupId: string) => {
    if (!$s.user.id || !$s.user.username) return

    const response = await ws.post(`/api/presence/${groupId}/join`, {
        userId: $s.user.id,
        username: $s.user.username,
    })

    // Response contains current members list
    if (response && response.members) {
        // Update users list with current members
        for (const member of response.members) {
            const existingUser = $s.users.find(u => u.id === member.id)
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
    if (!$s.user.id) return

    ws.post(`/api/presence/${groupId}/leave`, {
        userId: $s.user.id,
    })
}

/**
 * Query presence for a group
 */
export const queryGroupPresence = async (groupId: string) => {
    const response = await ws.get(`/api/presence/${groupId}/members`, {})
    return response?.members || []
}
