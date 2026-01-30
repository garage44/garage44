/**
 * Agent Comment Broadcasting
 * Allows agents to add comments and broadcast them via WebSocket
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {db} from '../database.ts'
import {logger} from '../../service.ts'
import {randomId} from '@garage44/common/lib/utils'

let wsManager: WebSocketServerManager | null = null

/**
 * Initialize comment broadcasting
 */
export function initAgentCommentBroadcasting(manager: WebSocketServerManager) {
    wsManager = manager
    logger.info('[Agent Comments] Initialized agent comment broadcasting')
}

/**
 * Add a comment to a ticket and broadcast it via WebSocket
 */
export async function addAgentComment(
    ticketId: string,
    agentName: string,
    content: string,
): Promise<void> {
    const commentId = randomId()
    const now = Date.now()

    db.prepare(`
        INSERT INTO comments (id, ticket_id, author_type, author_id, content, created_at)
        VALUES (?, ?, 'agent', ?, ?, ?)
    `).run(commentId, ticketId, agentName, content, now)

    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(commentId)

    // Broadcast comment creation
    if (wsManager) {
        wsManager.broadcast('/tickets', {
            comment,
            ticketId,
            type: 'comment:created',
        })
        logger.info(`[Agent Comments] Added and broadcast comment ${commentId} to ticket ${ticketId}`)
    } else {
        logger.warn('[Agent Comments] WebSocket manager not initialized, comment added but not broadcast')
    }
}
