/**
 * Tickets WebSocket API Routes
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {db} from '../lib/database.ts'
import {randomId} from '@garage44/common/lib/utils'
import {logger} from '../service.ts'

export function registerTicketsWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    // Get all tickets
    wsManager.api.get('/api/tickets', async(_ctx, _req) => {
        const tickets = db.prepare(`
            SELECT t.*, r.name as repository_name
            FROM tickets t
            LEFT JOIN repositories r ON t.repository_id = r.id
            ORDER BY t.created_at DESC
        `).all() as Array<{
            assignee_id: string | null
            assignee_type: string | null
            branch_name: string | null
            created_at: number
            description: string | null
            id: string
            merge_request_id: string | null
            priority: number | null
            repository_id: string
            repository_name: string | null
            status: string
            title: string
            updated_at: number
        }>

        return {
            tickets,
        }
    })

    // Get ticket by ID
    wsManager.api.get('/api/tickets/:id', async(_ctx, _req) => {
        const ticketId = req.params.param0

        const ticket = db.prepare(`
            SELECT t.*, r.name as repository_name, r.path as repository_path
            FROM tickets t
            LEFT JOIN repositories r ON t.repository_id = r.id
            WHERE t.id = ?
        `).get(ticketId) as {
            assignee_id: string | null
            assignee_type: string | null
            branch_name: string | null
            created_at: number
            description: string | null
            id: string
            merge_request_id: string | null
            priority: number | null
            repository_id: string
            repository_name: string | null
            repository_path: string | null
            status: string
            title: string
            updated_at: number
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
            comments,
            ticket,
        }
    })

    // Create ticket
    wsManager.api.post('/api/tickets', async(_ctx, _req) => {
        const {
            assignee_id,
            assignee_type,
            description,
            priority,
            repository_id,
            status = 'backlog',
            title,
        } = req.data as {
            assignee_id?: string | null
            assignee_type?: 'agent' | 'human' | null
            description?: string
            priority?: number
            repository_id: string
            status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'closed'
            title: string
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
            ticket,
            type: 'ticket:created',
        })

        logger.info(`[API] Created ticket ${ticketId}: ${title}`)

        return {
            ticket,
        }
    })

    // Update ticket
    wsManager.api.put('/api/tickets/:id', async(_ctx, _req) => {
        const ticketId = req.params.param0
        const updates = req.data as Partial<{
            assignee_id: string
            assignee_type: string
            description: string
            priority: number
            status: string
            title: string
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
            ticket,
            type: 'ticket:updated',
        })

        return {
            ticket,
        }
    })

    // Delete ticket
    wsManager.api.delete('/api/tickets/:id', async(_ctx, _req) => {
        const ticketId = req.params.param0

        db.prepare('DELETE FROM tickets WHERE id = ?').run(ticketId)

        // Broadcast ticket deletion
        wsManager.broadcast('/tickets', {
            ticketId,
            type: 'ticket:deleted',
        })

        logger.info(`[API] Deleted ticket ${ticketId}`)

        return {
            success: true,
        }
    })

    // Add comment to ticket
    wsManager.api.post('/api/tickets/:id/comments', async(_ctx, _req) => {
        const ticketId = req.params.param0
        const {author_id, author_type, content, mentions} = req.data as {
            author_id: string
            author_type: 'agent' | 'human'
            content: string
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
            comment,
            ticketId,
            type: 'comment:created',
        })

        logger.info(`[API] Added comment to ticket ${ticketId}`)

        return {
            comment,
        }
    })

    // Subscribe to ticket updates
    wsManager.on('/tickets', (_ws) => {
        logger.debug('[API] Client subscribed to ticket updates')
    })
}
