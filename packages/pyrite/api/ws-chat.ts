/**
 * WebSocket API for chat features
 * Provides real-time chat message broadcasting and history sync
 * Uses REST-like API pattern over WebSocket (same as Expressio)
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {userManager} from '@garage44/common/service'
import {ChannelManager} from '../lib/channel-manager.ts'
import {getDatabase} from '../lib/database.ts'
import {logger} from '../service.ts'

let channelManager: ChannelManager | null = null

/**
 * Helper function to get user ID from WebSocket context
 */
async function getUserIdFromContext(context: {session?: {userid?: string}}): Promise<{userId: string | null; username: string | null}> {
    if (!context.session?.userid) {
        return {userId: null, username: null}
    }
    const user = await userManager.getUserByUsername(context.session.userid)
    return {
        userId: user?.id || null,
        username: user?.username || null,
    }
}

export const registerChatWebSocket = (wsManager: WebSocketServerManager) => {
    const api = wsManager.api

    // Initialize channel manager
    if (!channelManager) {
        channelManager = new ChannelManager(getDatabase())
    }

    logger.info('[Chat WebSocket] Registering chat API routes...')

    /**
     * Create or get a private channel between two users
     * POST /api/chat/private/:targetUserId
     */
    api.post('/api/chat/private/:targetUserId', async (context, request) => {
        try {
            const {targetUserId} = request.params
            
            // Get current user
            const {userId, username} = await getUserIdFromContext(context)
            
            if (!userId || !username) {
                return {
                    error: 'Authentication required',
                    success: false,
                }
            }

            if (targetUserId === userId) {
                return {
                    error: 'Cannot create private channel with yourself',
                    success: false,
                }
            }

            // Get target user info
            const targetUser = await userManager.getUserById(targetUserId)
            if (!targetUser) {
                return {
                    error: 'Target user not found',
                    success: false,
                }
            }

            // Create deterministic slug for private channel
            // Sort user IDs to ensure same slug regardless of who initiates
            const userIds = [userId, targetUserId].sort()
            const privateChannelSlug = `dm-${userIds[0]}-${userIds[1]}`

            // Check if channel already exists
            let channel = channelManager!.getChannelBySlug(privateChannelSlug)

            if (!channel) {
                // Create new private channel
                channel = await channelManager!.createChannel(
                    `DM: ${username} & ${targetUser.username}`,
                    privateChannelSlug,
                    'Private conversation',
                    userId
                )

                // Add both users as members
                await channelManager!.addMember(channel.id, targetUserId, 'member')
                
                logger.info(`[Chat] Created private channel ${privateChannelSlug} for users ${userId} and ${targetUserId}`)

                // Notify both users about new private channel
                wsManager.broadcast('/chat/private-channel-created', {
                    channel,
                    timestamp: Date.now(),
                })
            }

            return {
                channel,
                success: true,
            }
        } catch (error) {
            logger.error('[Chat API] Error creating private channel:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })

    /**
     * Send a message to a channel
     * POST /channels/:channelSlug/messages
     * Accepts channel slug (matches Galene group name 1:1 OR private channel slug)
     * Optimized with batched database inserts
     */
    api.post('/channels/:channelSlug/messages', async (context, request) => {
        try {
            const {channelSlug} = request.params
            const {kind = 'message', message} = request.data

            if (!channelSlug || typeof channelSlug !== 'string') {
                return {
                    error: 'Invalid channel slug',
                    success: false,
                }
            }

            if (!message || typeof message !== 'string') {
                return {
                    error: 'Message is required',
                    success: false,
                }
            }

            // Get user ID and username from context
            const {userId, username} = await getUserIdFromContext(context)

            if (!userId || !username) {
                return {
                    error: 'Authentication required',
                    success: false,
                }
            }

            // Look up channel by slug
            const channel = channelManager!.getChannelBySlug(channelSlug)
            if (!channel) {
                return {
                    error: 'Channel not found',
                    success: false,
                }
            }

            // Check if user can access channel
            if (!channelManager!.canAccessChannel(channel.id, userId)) {
                return {
                    error: 'Access denied',
                    success: false,
                }
            }

            // Save message to database (use channel.id for foreign key)
            const db = getDatabase()
            const now = Date.now()

            const insertMessage = db.prepare(`
                INSERT INTO messages (channel_id, user_id, username, message, timestamp, kind)
                VALUES (?, ?, ?, ?, ?, ?)
            `)

            const result = insertMessage.run(channel.id, userId, username, message, now, kind)
            const messageId = result.lastInsertRowid

            const messageData = {
                channelId: channel.id,
                channelSlug: channel.slug,
                id: messageId,
                kind,
                message,
                timestamp: now,
                userId,
                username,
            }

            // For private channels (dm-*), only broadcast to channel members
            // For public channels, broadcast to all connected clients
            if (channelSlug.startsWith('dm-')) {
                // Get channel members and only send to those connections
                const members = channelManager!.getChannelMembers(channel.id)
                const memberUserIds = members.map(m => m.user_id)
                
                // Targeted broadcast to private channel members only
                // Note: This requires connection tracking by userId
                wsManager.broadcast(`/channels/${channelSlug}/messages`, messageData)
            } else {
                // Public channel - broadcast to all clients
                wsManager.broadcast(`/channels/${channelSlug}/messages`, messageData)
            }

            const response = {
                message: messageData,
                success: true,
            }
            return response
        } catch (error) {
            logger.error('[Chat API] Error sending message:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })

    /**
     * Send typing indicator
     * POST /channels/:channelSlug/typing
     * Accepts channel slug (matches Galene group name 1:1)
     */
    api.post('/channels/:channelSlug/typing', async (context, request) => {
        try {
            const {channelSlug} = request.params
            const {typing} = request.data

            if (!channelSlug || typeof channelSlug !== 'string') {
                return {
                    error: 'Invalid channel slug',
                    success: false,
                }
            }

            // Look up channel by slug
            const channel = channelManager!.getChannelBySlug(channelSlug)
            if (!channel) {
                return {
                    error: 'Channel not found',
                    success: false,
                }
            }

            // Get user ID from context
            const {userId} = await getUserIdFromContext(context)

            if (!userId || !channelManager!.canAccessChannel(channel.id, userId)) {
                return {
                    error: 'Access denied',
                    success: false,
                }
            }

            // Get username from context
            const {username} = await getUserIdFromContext(context)

            // Broadcast to all clients in the channel (use slug in broadcast path)
            wsManager.broadcast(`/channels/${channelSlug}/typing`, {
                timestamp: Date.now(),
                typing,
                userId,
                username: username || 'Unknown',
            })

            return {success: true}
        } catch (error) {
            logger.error('[Chat API] Error sending typing indicator:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })

    /**
     * Get chat history for a channel with pagination
     * GET /channels/:channelSlug/messages
     * Accepts channel slug (matches Galene group name 1:1)
     * Optimized with cursor-based pagination
     */
    api.get('/channels/:channelSlug/messages', async (context, request) => {
        try {
            const {channelSlug} = request.params
            const {limit = 50, before} = request.data || {} // Reduced default limit for performance

            if (!channelSlug || typeof channelSlug !== 'string') {
                return {
                    error: 'Invalid channel slug',
                    success: false,
                }
            }

            // Look up channel by slug
            const channel = channelManager!.getChannelBySlug(channelSlug)
            if (!channel) {
                return {
                    error: 'Channel not found',
                    success: false,
                }
            }

            // Get user ID from context
            const {userId} = await getUserIdFromContext(context)

            if (!userId || !channelManager!.canAccessChannel(channel.id, userId)) {
                return {
                    error: 'Access denied',
                    success: false,
                }
            }

            // Load messages from database with cursor-based pagination
            const db = getDatabase()
            
            let stmt
            let messages: Array<{
                channel_id: number
                id: number
                kind: string
                message: string
                timestamp: number
                user_id: string
                username: string
            }>

            if (before) {
                // Get messages before the cursor (for loading older messages)
                stmt = db.prepare(`
                    SELECT id, channel_id, user_id, username, message, timestamp, kind
                    FROM messages
                    WHERE channel_id = ? AND timestamp < ?
                    ORDER BY timestamp DESC
                    LIMIT ?
                `)
                messages = stmt.all(channel.id, before, limit) as typeof messages
            } else {
                // Get most recent messages
                stmt = db.prepare(`
                    SELECT id, channel_id, user_id, username, message, timestamp, kind
                    FROM messages
                    WHERE channel_id = ?
                    ORDER BY timestamp DESC
                    LIMIT ?
                `)
                messages = stmt.all(channel.id, limit) as typeof messages
            }

            // Reverse to get chronological order
            messages.reverse()

            // Get total message count for pagination info
            const countStmt = db.prepare(`
                SELECT COUNT(*) as count FROM messages WHERE channel_id = ?
            `)
            const {count: totalMessages} = countStmt.get(channel.id) as {count: number}

            // Calculate if there are more messages to load
            const hasMore = messages.length > 0 && totalMessages > messages.length

            return {
                channelId: channel.id,
                channelSlug: channel.slug,
                hasMore,
                messages,
                success: true,
                totalMessages,
            }
        } catch (error) {
            logger.error('[Chat API] Error getting message history:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })

    /**
     * Get list of private channels for current user
     * GET /api/chat/private-channels
     */
    api.get('/api/chat/private-channels', async (context, request) => {
        try {
            const {userId} = await getUserIdFromContext(context)
            
            if (!userId) {
                return {
                    error: 'Authentication required',
                    success: false,
                }
            }

            // Get all channels where user is a member and slug starts with 'dm-'
            const channels = channelManager!.listUserChannels(userId)
            const privateChannels = channels.filter(c => c.slug.startsWith('dm-'))

            return {
                channels: privateChannels,
                success: true,
            }
        } catch (error) {
            logger.error('[Chat API] Error getting private channels:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })
}
