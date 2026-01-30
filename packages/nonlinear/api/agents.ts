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
import {getAgentStatus} from '../lib/agent/status.ts'
import {DEFAULT_AVATARS} from '../lib/agent/avatars.ts'
import {getTokenUsage} from '../lib/agent/token-usage.ts'
import {config} from '../lib/config.ts'

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
        `).all() as Array<{
            avatar: string | null
            config: string
            created_at: number
            display_name: string | null
            enabled: number
            id: string
            name: string
            status: string
            type: 'prioritizer' | 'developer' | 'reviewer'
        }>

        // Enrich with status information
        const enrichedAgents = agents.map((agent) => {
            const status = getAgentStatus(agent.id)
            return {
                ...agent,
                avatar: agent.avatar || DEFAULT_AVATARS[agent.type],
                display_name: agent.display_name || `${agent.name} Agent`,
                status: status?.status || (agent.status as 'idle' | 'working' | 'error' | 'offline') || 'idle',
                currentTicketId: status?.currentTicketId || null,
                lastActivity: status?.lastActivity || agent.created_at,
            }
        })

        return {
            agents: enrichedAgents,
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

        const defaultAvatar = DEFAULT_AVATARS[type]
        const defaultDisplayName = `${name} Agent`

        db.prepare(`
            INSERT INTO agents (id, name, type, config, enabled, avatar, display_name, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            agentId,
            name,
            type,
            JSON.stringify(config || {}),
            enabled === false ? 0 : 1,
            defaultAvatar,
            defaultDisplayName,
            'idle',
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

    // Get Anthropic token usage
    wsManager.api.get('/api/anthropic/usage', async(_ctx, _req) => {
        const usage = getTokenUsage()
        logger.debug(`[API] Token usage requested: ${JSON.stringify(usage)}`)
        return {
            usage,
        }
    })

    // Test Anthropic API call to fetch usage
    wsManager.api.post('/api/anthropic/test', async(_ctx, _req) => {
        const apiKey = config.anthropic.apiKey || process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
            throw new Error('Anthropic API key not configured')
        }

        logger.info('[API] Making test Anthropic API call to fetch usage headers')

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                    'x-api-key': apiKey,
                },
                body: JSON.stringify({
                    model: config.anthropic.model || 'claude-3-5-sonnet-20241022',
                    max_tokens: 10,
                    messages: [
                        {
                            role: 'user',
                            content: 'Say "test"',
                        },
                    ],
                }),
            })

            logger.info(`[API] Test API call response status: ${response.status}`)

            // Log all headers
            const allHeaders: Record<string, string> = {}
            response.headers.forEach((value, key) => {
                allHeaders[key] = value
            })
            logger.info(`[API] All response headers: ${JSON.stringify(allHeaders, null, 2)}`)

            const limitHeader = response.headers.get('anthropic-ratelimit-tokens-limit')
            const remainingHeader = response.headers.get('anthropic-ratelimit-tokens-remaining')
            const resetHeader = response.headers.get('anthropic-ratelimit-tokens-reset')

            logger.info(`[API] Rate limit headers:`)
            logger.info(`  limit: ${limitHeader}`)
            logger.info(`  remaining: ${remainingHeader}`)
            logger.info(`  reset: ${resetHeader}`)

            if (!response.ok) {
                const error = await response.json().catch(() => ({error: {message: 'Unknown error'}}))
                throw new Error(error.error?.message || `API error: ${response.status}`)
            }

            const data = await response.json()

            if (limitHeader && remainingHeader) {
                const {updateUsageFromHeaders} = await import('../lib/agent/token-usage.ts')
                updateUsageFromHeaders({
                    limit: parseInt(limitHeader, 10),
                    remaining: parseInt(remainingHeader, 10),
                    reset: resetHeader || undefined,
                })
            }

            return {
                success: true,
                message: 'Test API call completed',
                headers: {
                    limit: limitHeader,
                    remaining: remainingHeader,
                    reset: resetHeader,
                },
                usage: getTokenUsage(),
            }
        } catch (error) {
            logger.error(`[API] Test API call failed: ${error}`)
            throw error
        }
    })

    // Subscribe to Anthropic usage updates
    wsManager.on('/anthropic', (_ws) => {
        logger.debug('[API] Client subscribed to Anthropic usage updates')
    })
}
