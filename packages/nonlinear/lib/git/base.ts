/**
 * Abstract Git Platform Interface
 * All git platform adapters must implement this interface
 */

import type {Repository} from '../database.ts'

export interface MRStatus {
    id: string
    state: 'open' | 'closed' | 'merged'
    url: string
    title: string
    description: string
}

export interface GitPlatform {
    /**
     * Create a new branch in the repository
     */
    createBranch(repo: Repository, branchName: string): Promise<string>

    /**
     * Create a merge request/pull request
     */
    createMergeRequest(
        repo: Repository,
        branch: string,
        title: string,
        description: string,
    ): Promise<string>

    /**
     * Add a comment to a merge request
     */
    addComment(repo: Repository, mrId: string, comment: string): Promise<void>

    /**
     * Get the status of a merge request
     */
    getStatus(repo: Repository, branch: string): Promise<MRStatus | null>

    /**
     * Check if the platform is properly configured
     */
    isConfigured(): boolean
}
