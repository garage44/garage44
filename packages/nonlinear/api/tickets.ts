/**
 * Tickets WebSocket API Routes
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {db} from '../lib/database.ts'
import {randomId} from '@garage44/common/lib/utils'
import {logger} from '../service.ts'

export function registerTicketsWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    // Get all tickets
    wsManager.api.get('/api/tickets', async(ctx, req) => {
        const tickets = db.prepare(`
            SELECT t.*, r.name as repository_name
            FROM tickets t
            LEFT JOIN repositories r ON t.repository_id = r.id
            ORDER BY t.created_at DESC
        `).all() as Array<{
            id: string
            repository_id: string
            title: string
            description: string | null
            status: string
            priority: number | null
            assignee_type: string | null
            assignee_id: string | null
            branch_name: string | null
            merge_request_id: string | null
            created_at: number
            updated_at: number
            repository_name: string | null
        }>

        return {
            tickets,
        }
    })

    // Get ticket by ID
    wsManager.api.get('/api/tickets/:id', async(ctx, req) => {
        const ticketId = req.params.param0

        const ticket = db.prepare(`
            SELECT t.*, r.name as repository_name, r.path as repository_path
            FROM tickets t
            LEFT JOIN repositories r ON t.repository_id = r.id
            WHERE t.id = ?
        `).get(ticketId) as {
            id: string
            repository_id: string
            title: string
            description: string | null
            status: string
            priority: number | null
            assignee_type: string | null
            assignee_id: string | null
            branch_name: string | null
            merge_request_id: string | null
            created_at: number
            updated_at: number
            repository_name: string | null
            repository_path: string | null
        } | undefined

        if (!ticket) {
            throw new Error('Ticket not found')
        }

        // Get comments
        const comments = db.prepare(`
            SELECT * FROM comments
            WHERE ticket_id = ?
            ORDER BY created_at ASC
        `).all(ticketId)

        return {
            ticket,
            comments,
        }
    })

    // Create ticket
    wsManager.api.post('/api/tickets', async(ctx, req) => {
        const {
            repository_id,
            title,
            description,
            status = 'backlog',
            priority,
            assignee_type,
            assignee_id,
        } = req.data as {
            repository_id: string
            title: string
            description?: string
            status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'closed'
            priority?: number
            assignee_type?: 'agent' | 'human' | null
            assignee_id?: string | null
        }

        if (!repository_id || !title) {
            throw new Error('repository_id and title are required')
        }

        const ticketId = randomId()
        const now = Date.now()

        db.prepare(`
            INSERT INTO tickets (
                id, repository_id, title, description, status,
                priority, assignee_type, assignee_id,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            ticketId,
            repository_id,
            title,
            description || null,
            status,
            priority || null,
            assignee_type || null,
            assignee_id || null,
            now,
            now,
        )

        const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId)

        // Broadcast ticket creation
        wsManager.broadcast('/tickets', {
            type: 'ticket:created',
            ticket,
        })

        logger.info(`[API] Created ticket ${ticketId}: ${title}`)

        return {
            ticket,
        }
    })

    // Update ticket
    wsManager.api.put('/api/tickets/:id', async(ctx, req) => {
        const ticketId = req.params.param0
        const updates = req.data as Partial<{
            title: string
            description: string
            status: string
            priority: number
            assignee_type: string
            assignee_id: string
        }>

        // Build update query dynamically
        const fields: string[] = []
        const values: unknown[] = []

        if (updates.title !== undefined) {
            fields.push('title = ?')
            values.push(updates.title)
        }
        if (updates.description !== undefined) {
            fields.push('description = ?')
            values.push(updates.description)
        }
        if (updates.status !== undefined) {
            fields.push('status = ?')
            values.push(updates.status)
        }
        if (updates.priority !== undefined) {
            fields.push('priority = ?')
            values.push(updates.priority)
        }
        if (updates.assignee_type !== undefined) {
            fields.push('assignee_type = ?')
            values.push(updates.assignee_type)
        }
        if (updates.assignee_id !== undefined) {
            fields.push('assignee_id = ?')
            values.push(updates.assignee_id)
        }

        if (fields.length === 0) {
            throw new Error('No fields to update')
        }

        fields.push('updated_at = ?')
        values.push(Date.now())
        values.push(ticketId)

        db.prepare(`
            UPDATE tickets
            SET ${fields.join(', ')}
            WHERE id = ?
        `).run(...values)

        const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId)

        // Broadcast ticket update
        wsManager.broadcast('/tickets', {
            type: 'ticket:updated',
            ticket,
        })

        return {
            ticket,
        }
    })

    // Delete ticket
    wsManager.api.delete('/api/tickets/:id', async(ctx, req) => {
        const ticketId = req.params.param0

        db.prepare('DELETE FROM tickets WHERE id = ?').run(ticketId)

        // Broadcast ticket deletion
        wsManager.broadcast('/tickets', {
            type: 'ticket:deleted',
            ticketId,
        })

        logger.info(`[API] Deleted ticket ${ticketId}`)

        return {
            success: true,
        }
    })

    // Add comment to ticket
    wsManager.api.post('/api/tickets/:id/comments', async(ctx, req) => {
        const ticketId = req.params.param0
        const {content, author_type, author_id, mentions} = req.data as {
            content: string
            author_type: 'agent' | 'human'
            author_id: string
            mentions?: string[]
        }

        if (!content || !author_type || !author_id) {
            throw new Error('content, author_type, and author_id are required')
        }

        const commentId = randomId()
        const now = Date.now()

        db.prepare(`
            INSERT INTO comments (
                id, ticket_id, author_type, author_id, content, mentions, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            commentId,
            ticketId,
            author_type,
            author_id,
            content,
            mentions ? JSON.stringify(mentions) : null,
            now,
        )

        const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(commentId)

        // Broadcast comment creation
        wsManager.broadcast('/tickets', {
            type: 'comment:created',
            ticketId,
            comment,
        })

        logger.info(`[API] Added comment to ticket ${ticketId}`)

        return {
            comment,
        }
    })

    // Subscribe to ticket updates
    wsManager.on('/tickets', (ws) => {
        logger.debug('[API] Client subscribed to ticket updates')
    })
}
