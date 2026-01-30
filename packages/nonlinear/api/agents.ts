/**
 * Agents WebSocket API Routes
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {db} from '../lib/database.ts'
import {logger} from '../service.ts'
import {PrioritizerAgent} from '../lib/agent/prioritizer.ts'
import {DeveloperAgent} from '../lib/agent/developer.ts'
import {ReviewerAgent} from '../lib/agent/reviewer.ts'
import {randomId} from '@garage44/common/lib/utils'

// Agent instances (singletons)
let prioritizerAgent: PrioritizerAgent | null = null
let developerAgent: DeveloperAgent | null = null
let reviewerAgent: ReviewerAgent | null = null

function getAgent(type: 'prioritizer' | 'developer' | 'reviewer') {
    switch (type) {
        case 'prioritizer':
            if (!prioritizerAgent) {
                prioritizerAgent = new PrioritizerAgent()
            }
            return prioritizerAgent
        case 'developer':
            if (!developerAgent) {
                developerAgent = new DeveloperAgent()
            }
            return developerAgent
        case 'reviewer':
            if (!reviewerAgent) {
                reviewerAgent = new ReviewerAgent()
            }
            return reviewerAgent
    }
}

export function registerAgentsWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    // Get all agents
    wsManager.api.get('/api/agents', async(_ctx, _req) => {
        const agents = db.prepare(`
            SELECT * FROM agents
            ORDER BY type, name
        `).all()

        return {
            agents,
        }
    })

    // Get agent by ID
    wsManager.api.get('/api/agents/:id', async(_ctx, req) => {
        const agentId = req.params.id

        const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId)

        if (!agent) {
            throw new Error('Agent not found')
        }

        return {
            agent,
        }
    })

    // Register/create agent
    wsManager.api.post('/api/agents', async(ctx, req) => {
        const {config, enabled, name, type} = req.data as {
            config?: Record<string, unknown>
            enabled?: boolean
            name: string
            type: 'prioritizer' | 'developer' | 'reviewer'
        }

        if (!name || !type) {
            throw new Error('name and type are required')
        }

        const agentId = randomId()
        const now = Date.now()

        db.prepare(`
            INSERT INTO agents (id, name, type, config, enabled, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            agentId,
            name,
            type,
            JSON.stringify(config || {}),
            enabled === false ? 0 : 1,
            now,
        )

        const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId)

        // Broadcast agent creation
        wsManager.broadcast('/agents', {
            agent,
            type: 'agent:created',
        })

        logger.info(`[API] Registered agent ${agentId}: ${name} (${type})`)

        return {
            agent,
        }
    })

    // Trigger agent to process work
    wsManager.api.post('/api/agents/:id/trigger', async(ctx, req) => {
        const agentId = req.params.id
        const context = req.data as Record<string, unknown> || {}

        const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId) as {
            enabled: number
            id: string
            name: string
            type: 'prioritizer' | 'developer' | 'reviewer'
        } | undefined

        if (!agent) {
            throw new Error('Agent not found')
        }

        if (agent.enabled === 0) {
            throw new Error('Agent is disabled')
        }

        const agentInstance = getAgent(agent.type)

        logger.info(`[API] Triggering agent ${agent.name} (${agent.type})`)

        // Run agent asynchronously
        agentInstance.process(context).then((result) => {
            // Broadcast agent completion
            wsManager.broadcast('/agents', {
                agentId: agent.id,
                result,
                type: 'agent:completed',
            })

            logger.info(`[API] Agent ${agent.name} completed: ${result.message}`)
        }).catch((error) => {
            // Broadcast agent error
            wsManager.broadcast('/agents', {
                agentId: agent.id,
                error: error.message,
                type: 'agent:error',
            })

            logger.error(`[API] Agent ${agent.name} error: ${error}`)
        })

        return {
            message: `Agent ${agent.name} triggered`,
            success: true,
        }
    })

    // Update agent
    wsManager.api.put('/api/agents/:id', async(ctx, req) => {
        const agentId = req.params.id
        const updates = req.data as Partial<{
            config: Record<string, unknown>
            enabled: boolean
            name: string
        }>

        const fields: string[] = []
        const values: unknown[] = []

        if (updates.name !== undefined) {
            fields.push('name = ?')
            values.push(updates.name)
        }
        if (updates.config !== undefined) {
            fields.push('config = ?')
            values.push(JSON.stringify(updates.config))
        }
        if (updates.enabled !== undefined) {
            fields.push('enabled = ?')
            values.push(updates.enabled ? 1 : 0)
        }

        if (fields.length === 0) {
            throw new Error('No fields to update')
        }

        values.push(agentId)

        db.prepare(`
            UPDATE agents
            SET ${fields.join(', ')}
            WHERE id = ?
        `).run(...values)

        const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId)

        // Broadcast agent update
        wsManager.broadcast('/agents', {
            agent,
            type: 'agent:updated',
        })

        return {
            agent,
        }
    })

    // Delete agent
    wsManager.api.delete('/api/agents/:id', async(_ctx, req) => {
        const agentId = req.params.id

        db.prepare('DELETE FROM agents WHERE id = ?').run(agentId)

        // Broadcast agent deletion
        wsManager.broadcast('/agents', {
            agentId,
            type: 'agent:deleted',
        })

        logger.info(`[API] Deleted agent ${agentId}`)

        return {
            success: true,
        }
    })

    // Subscribe to agent updates
    wsManager.on('/agents', (_ws) => {
        logger.debug('[API] Client subscribed to agent updates')
    })
}
