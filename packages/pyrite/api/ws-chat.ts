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
     * Send a message to a channel
     * POST /channels/:channelId/messages
     */
    api.post('/channels/:channelId/messages', async (context, request) => {
        try {
            const {channelId} = request.params
            const channelIdNum = parseInt(channelId, 10)
            const {kind = 'message', message} = request.data

            if (isNaN(channelIdNum)) {
                return {
                    error: 'Invalid channel ID',
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

            // Check if user can access channel
            if (!channelManager!.canAccessChannel(channelIdNum, userId)) {
                return {
                    error: 'Access denied',
                    success: false,
                }
            }

            // Save message to database
            const db = getDatabase()
            const now = Date.now()

            const insertMessage = db.prepare(`
                INSERT INTO messages (channel_id, user_id, username, message, timestamp, kind)
                VALUES (?, ?, ?, ?, ?, ?)
            `)

            const result = insertMessage.run(channelIdNum, userId, username, message, now, kind)
            const messageId = result.lastInsertRowid

            const messageData = {
                channelId: channelIdNum,
                id: messageId,
                kind,
                message,
                timestamp: now,
                userId,
                username,
            }

            // Broadcast to all clients in the channel
            wsManager.broadcast(`/channels/${channelId}/messages`, messageData)

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
     * POST /api/channels/:channelId/typing
     */
    api.post('/channels/:channelId/typing', async (context, request) => {
        try {
            const {channelId} = request.params
            const channelIdNum = parseInt(channelId, 10)
            const {typing} = request.data

            if (isNaN(channelIdNum)) {
                return {
                    error: 'Invalid channel ID',
                    success: false,
                }
            }

            // Get user ID from context
            const {userId} = await getUserIdFromContext(context)

            if (!userId || !channelManager!.canAccessChannel(channelIdNum, userId)) {
                return {
                    error: 'Access denied',
                    success: false,
                }
            }

            // Get username from context
            const {username} = await getUserIdFromContext(context)

            // Broadcast to all clients in the channel
            wsManager.broadcast(`/channels/${channelId}/typing`, {
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
     * Get chat history for a channel
     * GET /api/channels/:channelId/messages
     */
    api.get('/channels/:channelId/messages', async (context, request) => {
        try {
            const {channelId} = request.params
            const channelIdNum = parseInt(channelId, 10)
            const {limit = 100} = request.data || {}

            if (isNaN(channelIdNum)) {
                return {
                    error: 'Invalid channel ID',
                    success: false,
                }
            }

            // Get user ID from context
            const {userId} = await getUserIdFromContext(context)

            if (!userId || !channelManager!.canAccessChannel(channelIdNum, userId)) {
                return {
                    error: 'Access denied',
                    success: false,
                }
            }

            // Load messages from database
            const db = getDatabase()
            const stmt = db.prepare(`
                SELECT id, channel_id, user_id, username, message, timestamp, kind
                FROM messages
                WHERE channel_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
            `)

            const messages = stmt.all(channelIdNum, limit) as Array<{
                channel_id: number
                id: number
                kind: string
                message: string
                timestamp: number
                user_id: string // TEXT/UUID, not number
                username: string
            }>

            // Reverse to get chronological order
            messages.reverse()

            return {
                channelId: channelIdNum,
                messages,
                success: true,
            }
        } catch (error) {
            logger.error('[Chat API] Error getting message history:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })
}
