/**
 * Prioritization Agent
 * Analyzes backlog tickets and moves high-priority ones to "todo"
 */

import {BaseAgent, type AgentContext, type AgentResponse} from './base.ts'
import {db} from '../database.ts'
import {logger} from '../../service.ts'
import {randomId} from '@garage44/common/lib/utils'

export class PrioritizerAgent extends BaseAgent {
    constructor() {
        super('Prioritizer', 'prioritizer')
    }

    async process(context: AgentContext): Promise<AgentResponse> {
        try {
            // Get all backlog tickets
            const backlogTickets = db.prepare(`
                SELECT * FROM tickets
                WHERE status = 'backlog'
                ORDER BY created_at ASC
            `).all() as Array<{
                id: string
                repository_id: string
                title: string
                description: string | null
                priority: number | null
                created_at: number
            }>

            if (backlogTickets.length === 0) {
                this.log('No backlog tickets to prioritize')
                return {
                    success: true,
                    message: 'No backlog tickets found',
                }
            }

            this.log(`Analyzing ${backlogTickets.length} backlog tickets`)

            // Get repository information for context
            const repositories = new Map<string, {name: string; path: string}>()
            for (const ticket of backlogTickets) {
                if (!repositories.has(ticket.repository_id)) {
                    const repo = db.prepare('SELECT name, path FROM repositories WHERE id = ?').get(ticket.repository_id) as {name: string; path: string} | undefined
                    if (repo) {
                        repositories.set(ticket.repository_id, repo)
                    }
                }
            }

            // Build context for LLM
            const ticketsContext = backlogTickets.map((ticket) => {
                const repo = repositories.get(ticket.repository_id)
                return {
                    id: ticket.id,
                    title: ticket.title,
                    description: ticket.description || '',
                    repository: repo?.name || 'Unknown',
                    created_at: new Date(ticket.created_at).toISOString(),
                    current_priority: ticket.priority,
                }
            })

            const systemPrompt = `You are a project management AI agent that prioritizes software development tickets.

Your task is to:
1. Analyze each ticket in the backlog
2. Assign a priority score from 0-100 (higher = more urgent)
3. Identify which tickets should be moved to "todo" status (priority >= 70)

Consider:
- Ticket dependencies and blocking relationships
- Business value and user impact
- Technical complexity and effort required
- Urgency and deadlines
- Repository context and project state

Respond with a JSON array of objects, each with:
- ticket_id: The ticket ID
- priority: Priority score (0-100)
- should_move_to_todo: boolean (true if priority >= 70)
- reasoning: Brief explanation of the priority`

            const userMessage = `Analyze these backlog tickets and prioritize them:

${JSON.stringify(ticketsContext, null, 2)}`

            const response = await this.respond(systemPrompt, userMessage)

            // Parse LLM response
            let prioritizations: Array<{
                ticket_id: string
                priority: number
                should_move_to_todo: boolean
                reasoning: string
            }>

            try {
                // Try to extract JSON from response (might have markdown code blocks)
                const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/)
                const jsonStr = jsonMatch ? jsonMatch[1] : response
                prioritizations = JSON.parse(jsonStr)
            } catch (error) {
                this.log(`Failed to parse LLM response: ${error}`, 'error')
                return {
                    success: false,
                    message: 'Failed to parse prioritization response',
                    error: String(error),
                }
            }

            // Update tickets in database
            let movedCount = 0
            const updateStmt = db.prepare(`
                UPDATE tickets
                SET priority = ?, status = ?, updated_at = ?
                WHERE id = ?
            `)

            const updateTransaction = db.transaction((prioritizations) => {
                for (const p of prioritizations) {
                    const newStatus = p.should_move_to_todo ? 'todo' : 'backlog'
                    updateStmt.run(p.priority, newStatus, Date.now(), p.ticket_id)

                    if (p.should_move_to_todo) {
                        movedCount++
                        this.log(`Moved ticket ${p.ticket_id} to todo (priority: ${p.priority})`)
                    } else {
                        this.log(`Updated priority for ticket ${p.ticket_id}: ${p.priority}`)
                    }
                }
            })

            updateTransaction(prioritizations)

            this.log(`Prioritization complete: ${movedCount} tickets moved to todo, ${prioritizations.length - movedCount} remain in backlog`)

            return {
                success: true,
                message: `Prioritized ${prioritizations.length} tickets, moved ${movedCount} to todo`,
                data: {
                    total: prioritizations.length,
                    moved: movedCount,
                },
            }
        } catch (error) {
            this.log(`Error during prioritization: ${error}`, 'error')
            return {
                success: false,
                message: 'Prioritization failed',
                error: error instanceof Error ? error.message : String(error),
            }
        }
    }
}
