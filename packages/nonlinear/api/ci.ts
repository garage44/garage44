/**
 * CI WebSocket API Routes
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {db} from '../lib/database.ts'
import {logger} from '../service.ts'
import {CIRunner} from '../lib/ci/runner.ts'

export function registerCIWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    // Get CI runs for a ticket
    wsManager.api.get('/api/ci/runs/:ticketId', async(_ctx, req) => {
        const ticketId = req.params.ticketId

        const runs = db.prepare(`
            SELECT * FROM ci_runs
            WHERE ticket_id = ?
            ORDER BY started_at DESC
        `).all(ticketId)

        return {
            runs,
        }
    })

    // Get CI run by ID
    wsManager.api.get('/api/ci/runs/id/:id', async(_ctx, req) => {
        const runId = req.params.id

        const run = db.prepare('SELECT * FROM ci_runs WHERE id = ?').get(runId)

        if (!run) {
            throw new Error('CI run not found')
        }

        return {
            run,
        }
    })

    // Trigger CI run for a ticket
    wsManager.api.post('/api/ci/run', async(_ctx, req) => {
        const {repository_path, ticket_id} = req.data as {
            repository_path: string
            ticket_id: string
        }

        if (!ticket_id || !repository_path) {
            throw new Error('ticket_id and repository_path are required')
        }

        // Verify ticket exists
        const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticket_id)
        if (!ticket) {
            throw new Error('Ticket not found')
        }

        logger.info(`[API] Triggering CI run for ticket ${ticket_id}`)

        // Run CI asynchronously
        const runner = new CIRunner()
        runner.run(ticket_id, repository_path).then((result) => {
            // Broadcast CI completion
            wsManager.broadcast('/ci', {
                result,
                ticketId: ticket_id,
                type: 'ci:completed',
            })

            logger.info(`[API] CI run completed for ticket ${ticket_id}: ${result.success ? 'success' : 'failed'}`)
        }).catch((error) => {
            // Broadcast CI error
            wsManager.broadcast('/ci', {
                error: error.message,
                ticketId: ticket_id,
                type: 'ci:error',
            })

            logger.error(`[API] CI run error for ticket ${ticket_id}: ${error}`)
        })

        return {
            message: 'CI run started',
            success: true,
        }
    })

    // Subscribe to CI updates
    wsManager.on('/ci', (_ws) => {
        logger.debug('[API] Client subscribed to CI updates')
    })
}
