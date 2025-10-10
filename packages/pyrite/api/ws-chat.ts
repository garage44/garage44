/**
 * WebSocket API for chat features
 * Provides real-time chat message broadcasting and history sync
 * Uses REST-like API pattern over WebSocket (same as Expressio)
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'

export const registerChatWebSocket = (wsManager: WebSocketServerManager) => {
    const api = wsManager.api

    /**
     * Broadcast chat message to all connected clients in a group
     * POST /api/chat/:groupId/message
     */
    api.post('/api/chat/:groupId/message', async (context, request) => {
        const {groupId} = request.params
        const {message, nick, kind = 'message'} = request.data

        // Broadcast to all clients
        wsManager.broadcast(`/chat/${groupId}/message`, {
            groupId,
            message,
            nick,
            kind,
            timestamp: Date.now(),
        })

        return {success: true}
    })

    /**
     * Send typing indicator
     * POST /api/chat/:groupId/typing
     */
    api.post('/api/chat/:groupId/typing', async (context, request) => {
        const {groupId} = request.params
        const {userId, typing} = request.data

        // Broadcast to all clients in group
        wsManager.broadcast(`/chat/${groupId}/typing`, {
            userId,
            typing,
        })

        return {success: true}
    })

    /**
     * Get chat history for a group
     * GET /api/chat/:groupId/history
     */
    api.get('/api/chat/:groupId/history', async (context, request) => {
        const {groupId} = request.params
        const {limit = 100} = request.data || {}

        // In the current architecture, chat history is managed by SFU
        // This is a placeholder for future chat persistence
        return {
            groupId,
            messages: [], // Would load from database/storage
        }
    })
}
