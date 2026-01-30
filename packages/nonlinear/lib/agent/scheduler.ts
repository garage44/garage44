/**
 * Agent Scheduler
 * Automatically runs agents based on configuration and database state
 */

import {config} from '../config.ts'
import {db} from '../database.ts'
import {logger} from '../../service.ts'
import {PrioritizerAgent} from './prioritizer.ts'
import {DeveloperAgent} from './developer.ts'
import {ReviewerAgent} from './reviewer.ts'
import {updateAgentStatus, getAgentStatus, type AgentStatus} from './status.ts'
import {type AgentContext} from './base.ts'
import {randomId} from '@garage44/common/lib/utils'

interface AgentInstance {
    id: string
    name: string
    type: 'prioritizer' | 'developer' | 'reviewer'
    instance: PrioritizerAgent | DeveloperAgent | ReviewerAgent
    enabled: boolean
}

const agentInstances = new Map<string, AgentInstance>()
const runningAgents = new Map<string, Promise<void>>()
const schedulerIntervals = new Map<string, ReturnType<typeof setInterval>>()

/**
 * Initialize agent scheduler
 */
export async function initAgentScheduler() {
    // Load agents from database
    const agents = db.prepare(`
        SELECT id, name, type, enabled, status
        FROM agents
    `).all() as Array<{
        enabled: number
        id: string
        name: string
        status: string
        type: 'prioritizer' | 'developer' | 'reviewer'
    }>

    // Create default agents if none exist
    if (agents.length === 0) {
        logger.info('[Agent Scheduler] No agents found, creating default agents')
        await createDefaultAgents()
        return initAgentScheduler() // Recursively call to initialize defaults
    }

    // Initialize agent instances
    for (const agent of agents) {
        if (agent.enabled === 0) {
            logger.info(`[Agent Scheduler] Agent ${agent.name} is disabled, skipping`)
            continue
        }

        let instance: PrioritizerAgent | DeveloperAgent | ReviewerAgent
        switch (agent.type) {
            case 'prioritizer':
                instance = new PrioritizerAgent()
                break
            case 'developer':
                instance = new DeveloperAgent()
                break
            case 'reviewer':
                instance = new ReviewerAgent()
                break
            default:
                logger.warn(`[Agent Scheduler] Unknown agent type: ${agent.type}`)
                continue
        }

        agentInstances.set(agent.id, {
            id: agent.id,
            name: agent.name,
            type: agent.type,
            instance,
            enabled: agent.enabled === 1,
        })

        // Start scheduler for this agent
        startAgentScheduler(agent.id, agent.type)
    }

    logger.info(`[Agent Scheduler] Initialized ${agentInstances.size} agents`)
}

/**
 * Create default agents
 */
async function createDefaultAgents() {
    const now = Date.now()

    const defaultAgents = [
        {
            id: randomId(),
            name: 'Prioritizer',
            type: 'prioritizer' as const,
            avatar: 'placeholder-2.png',
            display_name: 'Prioritizer Agent',
            status: 'idle',
        },
        {
            id: randomId(),
            name: 'Developer',
            type: 'developer' as const,
            avatar: 'placeholder-3.png',
            display_name: 'Developer Agent',
            status: 'idle',
        },
        {
            id: randomId(),
            name: 'Reviewer',
            type: 'reviewer' as const,
            avatar: 'placeholder-4.png',
            display_name: 'Reviewer Agent',
            status: 'idle',
        },
    ]

    for (const agent of defaultAgents) {
        db.prepare(`
            INSERT INTO agents (id, name, type, config, enabled, avatar, display_name, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            agent.id,
            agent.name,
            agent.type,
            JSON.stringify({}),
            1,
            agent.avatar,
            agent.display_name,
            agent.status,
            now,
        )
    }

    logger.info('[Agent Scheduler] Created default agents')
}

/**
 * Start scheduler for a specific agent
 */
function startAgentScheduler(agentId: string, agentType: 'prioritizer' | 'developer' | 'reviewer') {
    const agentConfig = config.agents[agentType]

    if (!agentConfig?.enabled) {
        logger.info(`[Agent Scheduler] Agent ${agentId} (${agentType}) is disabled in config`)
        return
    }

    if (agentType === 'prioritizer') {
        // Prioritizer runs on interval
        const interval = agentConfig.checkInterval || 300000 // 5 minutes default
        const intervalId = setInterval(() => {
            runAgent(agentId, agentType).catch((error) => {
                logger.error(`[Agent Scheduler] Error running prioritizer: ${error}`)
            })
        }, interval)

        schedulerIntervals.set(agentId, intervalId)
        logger.info(`[Agent Scheduler] Started prioritizer scheduler (interval: ${interval}ms)`)

        // Run immediately
        runAgent(agentId, agentType).catch((error) => {
            logger.error(`[Agent Scheduler] Error running prioritizer: ${error}`)
        })
    } else {
        // Developer and Reviewer run continuously (check for work)
        const checkInterval = 10000 // Check every 10 seconds
        const intervalId = setInterval(() => {
            runAgent(agentId, agentType).catch((error) => {
                logger.error(`[Agent Scheduler] Error running ${agentType}: ${error}`)
            })
        }, checkInterval)

        schedulerIntervals.set(agentId, intervalId)
        logger.info(`[Agent Scheduler] Started ${agentType} scheduler (check interval: ${checkInterval}ms)`)

        // Run immediately
        runAgent(agentId, agentType).catch((error) => {
            logger.error(`[Agent Scheduler] Error running ${agentType}: ${error}`)
        })
    }
}

/**
 * Run an agent
 */
async function runAgent(agentId: string, agentType: 'prioritizer' | 'developer' | 'reviewer', context: Record<string, unknown> = {}) {
    const agent = agentInstances.get(agentId)
    if (!agent || !agent.enabled) {
        return
    }

    // Check if this is a mention trigger (has comment_id) - allow it even if agent is running
    const isMentionTrigger = !!context.comment_id

    // Check if agent is already running (skip unless it's a mention)
    if (runningAgents.has(agentId) && !isMentionTrigger) {
        logger.debug(`[Agent Scheduler] Agent ${agent.name} is already running, skipping`)
        return
    }

    // Check max concurrent limit
    const agentConfig = config.agents[agentType]
    const maxConcurrent = agentConfig?.maxConcurrent || 1

    // Count currently running agents of this type
    const runningCount = Array.from(runningAgents.keys()).filter((id) => {
        const a = agentInstances.get(id)
        return a && a.type === agentType
    }).length

    if (runningCount >= maxConcurrent) {
        logger.debug(`[Agent Scheduler] Max concurrent ${agentType} agents reached (${runningCount}/${maxConcurrent})`)
        return
    }

    // Check agent status (skip unless it's a mention trigger)
    const status = getAgentStatus(agentId)
    if (status && status.status === 'working' && !isMentionTrigger) {
        logger.debug(`[Agent Scheduler] Agent ${agent.name} is already working, skipping`)
        return
    }

    if (isMentionTrigger) {
        logger.info(`[Agent Scheduler] Mention trigger detected - forcing agent ${agent.name} to run even if working`)
    }

    // Run agent
    const runPromise = (async() => {
        try {
            updateAgentStatus(agentId, 'working')

            logger.info(`[Agent Scheduler] Running agent ${agent.name} (${agentType})`)
            const result = await agent.instance.process(context as AgentContext)

            if (result.success) {
                updateAgentStatus(agentId, 'idle')
                logger.info(`[Agent Scheduler] Agent ${agent.name} completed: ${result.message}`)
            } else {
                updateAgentStatus(agentId, 'error', null, result.error || 'Unknown error')
                logger.error(`[Agent Scheduler] Agent ${agent.name} failed: ${result.message}`)
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error)
            updateAgentStatus(agentId, 'error', null, errorMsg)
            logger.error(`[Agent Scheduler] Agent ${agent.name} error: ${error}`)
        } finally {
            runningAgents.delete(agentId)
        }
    })()

    runningAgents.set(agentId, runPromise)
    await runPromise
}

/**
 * Stop agent scheduler
 */
export function stopAgentScheduler() {
    for (const [agentId, intervalId] of schedulerIntervals) {
        clearInterval(intervalId)
        logger.info(`[Agent Scheduler] Stopped scheduler for agent ${agentId}`)
    }
    schedulerIntervals.clear()
}

/**
 * Manually trigger an agent
 */
export async function triggerAgent(agentId: string, context: Record<string, unknown> = {}) {
    const agent = agentInstances.get(agentId)
    if (!agent) {
        throw new Error(`Agent ${agentId} not found`)
    }

    if (!agent.enabled) {
        throw new Error(`Agent ${agent.name} is disabled`)
    }

    return runAgent(agentId, agent.type, context)
}
