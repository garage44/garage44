/**
 * Base Agent Class
 * All AI agents extend this class to provide common functionality
 */

import Anthropic from '@anthropic-ai/sdk'
import {logger} from '../../service.ts'
import {config} from '../config.ts'

export interface AgentContext {
    ticketId?: string
    repositoryId?: string
    branchName?: string
    mergeRequestId?: string
    [key: string]: unknown
}

export interface AgentResponse {
    success: boolean
    message: string
    data?: unknown
    error?: string
}

export abstract class BaseAgent {
    protected client: Anthropic
    protected model: string
    protected name: string
    protected type: 'prioritizer' | 'developer' | 'reviewer'

    constructor(name: string, type: 'prioritizer' | 'developer' | 'reviewer') {
        this.name = name
        this.type = type
        this.model = config.anthropic.model || 'claude-3-5-sonnet-20241022'

        const apiKey = config.anthropic.apiKey || process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
            throw new Error(`Anthropic API key not configured for agent ${name}. Set ANTHROPIC_API_KEY environment variable or configure in .nonlinearrc`)
        }

        this.client = new Anthropic({
            apiKey,
        })
    }

    /**
     * Process a task with the agent
     * Subclasses must implement this method
     */
    abstract process(context: AgentContext): Promise<AgentResponse>

    /**
     * Get context for the agent (ticket info, repository state, etc.)
     * Subclasses can override this to provide additional context
     */
    protected async getContext(context: AgentContext): Promise<string> {
        // Base implementation - subclasses should extend this
        return JSON.stringify(context, null, 2)
    }

    /**
     * Send a message to the LLM and get a response
     */
    protected async respond(systemPrompt: string, userMessage: string, maxTokens = 4096): Promise<string> {
        try {
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: maxTokens,
                system: systemPrompt,
                messages: [
                    {
                        role: 'user',
                        content: userMessage,
                    },
                ],
            })

            const content = response.content[0]
            if (content.type === 'text') {
                return content.text
            }

            throw new Error('Unexpected response type from Anthropic API')
        } catch (error) {
            logger.error(`[Agent ${this.name}] Error calling Anthropic API: ${error}`)
            throw error
        }
    }

    /**
     * Log agent activity
     */
    protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
        const logMessage = `[Agent ${this.name}] ${message}`
        switch (level) {
            case 'info':
                logger.info(logMessage)
                break
            case 'warn':
                logger.warn(logMessage)
                break
            case 'error':
                logger.error(logMessage)
                break
        }
    }

    /**
     * Retry a function with exponential backoff
     */
    protected async retry<T>(
        fn: () => Promise<T>,
        maxAttempts = 3,
        delay = 1000,
    ): Promise<T> {
        let lastError: Error | null = null

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn()
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error))
                if (attempt < maxAttempts) {
                    const waitTime = delay * Math.pow(2, attempt - 1)
                    this.log(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`, 'warn')
                    await new Promise((resolve) => setTimeout(resolve, waitTime))
                }
            }
        }

        throw lastError || new Error('Max retry attempts reached')
    }
}
