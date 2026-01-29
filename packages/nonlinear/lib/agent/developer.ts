/**
 * Development Agent
 * Picks up "todo" tickets, creates branches, implements code, and creates MRs
 */

import {BaseAgent, type AgentContext, type AgentResponse} from './base.ts'
import {db} from '../database.ts'
import {logger} from '../../service.ts'
import {createGitPlatform} from '../git/index.ts'
import {randomId} from '@garage44/common/lib/utils'
import {$} from 'bun'
import path from 'node:path'

export class DeveloperAgent extends BaseAgent {
    constructor() {
        super('Developer', 'developer')
    }

    async process(context: AgentContext): Promise<AgentResponse> {
        try {
            // Get a "todo" ticket that's not assigned
            const ticket = db.prepare(`
                SELECT t.*, r.path, r.platform, r.remote_url, r.config
                FROM tickets t
                JOIN repositories r ON t.repository_id = r.id
                WHERE t.status = 'todo'
                  AND t.assignee_type IS NULL
                ORDER BY t.priority DESC, t.created_at ASC
                LIMIT 1
            `).get() as {
                id: string
                repository_id: string
                title: string
                description: string | null
                path: string
                platform: 'github' | 'gitlab' | 'local'
                remote_url: string | null
                config: string
            } | undefined

            if (!ticket) {
                this.log('No unassigned todo tickets found')
                return {
                    success: true,
                    message: 'No tickets to work on',
                }
            }

            this.log(`Picking up ticket ${ticket.id}: ${ticket.title}`)

            // Assign ticket to this agent
            db.prepare(`
                UPDATE tickets
                SET status = 'in_progress',
                    assignee_type = 'agent',
                    assignee_id = ?,
                    updated_at = ?
                WHERE id = ?
            `).run(this.name, Date.now(), ticket.id)

            // Create branch name
            const branchName = `ticket-${ticket.id}-${Date.now()}`

            // Get git platform adapter
            const repo = {
                id: ticket.repository_id,
                path: ticket.path,
                platform: ticket.platform,
                remote_url: ticket.remote_url,
                config: ticket.config,
            } as const

            const gitPlatform = createGitPlatform(repo)

            // Create branch
            this.log(`Creating branch: ${branchName}`)
            await gitPlatform.createBranch(repo, branchName)

            // Update ticket with branch name
            db.prepare(`
                UPDATE tickets
                SET branch_name = ?,
                    updated_at = ?
                WHERE id = ?
            `).run(branchName, Date.now(), ticket.id)

            // Get repository context for implementation
            const repoContext = await this.getRepositoryContext(ticket.path)

            // Generate implementation plan using LLM
            const systemPrompt = `You are a software development AI agent working on a Bun/TypeScript project.

Your task is to:
1. Understand the ticket requirements
2. Analyze the codebase structure
3. Implement the necessary changes
4. Write tests if needed
5. Ensure code follows project conventions

You can:
- Read and analyze existing code
- Create new files
- Modify existing files
- Run tests and linting
- Fix any issues that arise

Respond with a JSON object containing:
- plan: Step-by-step implementation plan
- files_to_create: Array of files to create with their content
- files_to_modify: Array of files to modify with changes
- commands_to_run: Array of commands to run (e.g., tests, linting)`

            const userMessage = `Implement this ticket:

Title: ${ticket.title}
Description: ${ticket.description || 'No description'}

Repository Context:
${repoContext}

Provide a detailed implementation plan and the code changes needed.`

            const response = await this.respond(systemPrompt, userMessage, 8192)

            // Parse implementation plan
            let implementation: {
                plan: string[]
                files_to_create?: Array<{path: string; content: string}>
                files_to_modify?: Array<{path: string; changes: string}>
                commands_to_run?: string[]
            }

            try {
                const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/)
                const jsonStr = jsonMatch ? jsonMatch[1] : response
                implementation = JSON.parse(jsonStr)
            } catch (error) {
                this.log(`Failed to parse implementation plan: ${error}`, 'error')
                // Fallback: save the response as a comment and mark ticket as needing review
                await this.addComment(ticket.id, `Implementation plan generated but could not be parsed:\n\n${response}`)
                return {
                    success: false,
                    message: 'Failed to parse implementation plan',
                    error: String(error),
                }
            }

            // Apply implementation
            const originalCwd = process.cwd()
            try {
                process.chdir(ticket.path)

                // Create files
                if (implementation.files_to_create) {
                    for (const file of implementation.files_to_create) {
                        const filePath = path.join(ticket.path, file.path)
                        await Bun.write(filePath, file.content)
                        this.log(`Created file: ${file.path}`)
                    }
                }

                // Modify files (simplified - in real implementation, would use AST or diff)
                if (implementation.files_to_modify) {
                    for (const file of implementation.files_to_modify) {
                        this.log(`Would modify file: ${file.path}`)
                        // TODO: Implement file modification logic
                    }
                }

                // Commit changes
                await $`git add -A`.quiet()
                await $`git commit -m "Implement: ${ticket.title}"`.quiet()

                // Run commands (tests, linting)
                if (implementation.commands_to_run) {
                    for (const cmd of implementation.commands_to_run) {
                        this.log(`Running: ${cmd}`)
                        // TODO: Execute commands safely
                    }
                }

                // Create merge request
                const mrId = await gitPlatform.createMergeRequest(
                    repo,
                    branchName,
                    ticket.title,
                    ticket.description || '',
                )

                // Update ticket with MR ID
                db.prepare(`
                    UPDATE tickets
                    SET merge_request_id = ?,
                        status = 'review',
                        updated_at = ?
                    WHERE id = ?
                `).run(mrId, Date.now(), ticket.id)

                this.log(`Ticket ${ticket.id} implementation complete, MR created: ${mrId}`)

                return {
                    success: true,
                    message: `Implementation complete, MR #${mrId} created`,
                    data: {
                        ticketId: ticket.id,
                        branchName,
                        mergeRequestId: mrId,
                    },
                }
            } finally {
                process.chdir(originalCwd)
            }
        } catch (error) {
            this.log(`Error during development: ${error}`, 'error')
            // Mark ticket as needing attention
            if (context.ticketId) {
                db.prepare(`
                    UPDATE tickets
                    SET status = 'todo',
                        assignee_type = NULL,
                        assignee_id = NULL,
                        updated_at = ?
                    WHERE id = ?
                `).run(Date.now(), context.ticketId)
            }
            return {
                success: false,
                message: 'Development failed',
                error: error instanceof Error ? error.message : String(error),
            }
        }
    }

    private async getRepositoryContext(repoPath: string): Promise<string> {
        try {
            const packageJsonPath = path.join(repoPath, 'package.json')
            const packageJson = await Bun.file(packageJsonPath).text().catch(() => null)

            const readmePath = path.join(repoPath, 'README.md')
            const readme = await Bun.file(readmePath).text().catch(() => null)

            return JSON.stringify({
                packageJson: packageJson ? JSON.parse(packageJson) : null,
                readme: readme || null,
            }, null, 2)
        } catch (error) {
            return `Error reading repository context: ${error}`
        }
    }

    private async addComment(ticketId: string, content: string): Promise<void> {
        const commentId = randomId()
        db.prepare(`
            INSERT INTO comments (id, ticket_id, author_type, author_id, content, created_at)
            VALUES (?, ?, 'agent', ?, ?, ?)
        `).run(commentId, ticketId, this.name, content, Date.now())
    }
}
