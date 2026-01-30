/**
 * Agent Status Tracking
 * Tracks agent state and broadcasts status changes via WebSocket
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {db} from '../database.ts'
import {logger} from '../../service.ts'

export type AgentStatus = 'idle' | 'working' | 'error' | 'offline'

interface AgentStatusState {
    agentId: string
    status: AgentStatus
    currentTicketId: string | null
    lastActivity: number
    error: string | null
}

const agentStatuses = new Map<string, AgentStatusState>()

let wsManager: WebSocketServerManager | null = null

/**
 * Initialize agent status tracking
 */
export function initAgentStatusTracking(manager: WebSocketServerManager) {
    wsManager = manager

    // Load existing agent statuses from database
    const agents = db.prepare('SELECT id, status FROM agents').all() as Array<{id: string; status: string}>
    for (const agent of agents) {
        agentStatuses.set(agent.id, {
            agentId: agent.id,
            status: (agent.status || 'idle') as AgentStatus,
            currentTicketId: null,
            lastActivity: Date.now(),
            error: null,
        })
    }

    logger.info('[Agent Status] Initialized agent status tracking')
}

/**
 * Update agent status
 */
export function updateAgentStatus(
    agentId: string,
    status: AgentStatus,
    ticketId?: string | null,
    error?: string | null,
) {
    const currentState = agentStatuses.get(agentId) || {
        agentId,
        status: 'idle' as AgentStatus,
        currentTicketId: null,
        lastActivity: Date.now(),
        error: null,
    }

    const newState: AgentStatusState = {
        agentId,
        status,
        currentTicketId: ticketId || currentState.currentTicketId,
        lastActivity: Date.now(),
        error: error || null,
    }

    agentStatuses.set(agentId, newState)

    // Update database
    db.prepare(`
        UPDATE agents
        SET status = ?
        WHERE id = ?
    `).run(status, agentId)

    // Broadcast status change
    if (wsManager) {
        wsManager.broadcast('/agents', {
            agentId,
            status,
            currentTicketId: newState.currentTicketId,
            error: newState.error,
            lastActivity: newState.lastActivity,
            type: 'agent:status',
        })
    }

    logger.debug(`[Agent Status] Agent ${agentId} status: ${status}`)
}

/**
 * Get agent status
 */
export function getAgentStatus(agentId: string): AgentStatusState | null {
    return agentStatuses.get(agentId) || null
}

/**
 * Get all agent statuses
 */
export function getAllAgentStatuses(): AgentStatusState[] {
    return Array.from(agentStatuses.values())
}

/**
 * Clear agent status (when agent stops working)
 */
export function clearAgentStatus(agentId: string) {
    updateAgentStatus(agentId, 'idle', null, null)
}
