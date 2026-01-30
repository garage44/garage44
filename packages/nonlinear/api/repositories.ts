/**
 * Repositories WebSocket API Routes
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {db} from '../lib/database.ts'
import {randomId} from '@garage44/common/lib/utils'
import {logger} from '../service.ts'
import {getDefaultPlatform} from '../lib/git/index.ts'
import fs from 'fs-extra'
import path from 'node:path'

export function registerRepositoriesWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    // Get all repositories
    wsManager.api.get('/api/repositories', async(_ctx, _req) => {
        const repositories = db.prepare(`
            SELECT * FROM repositories
            ORDER BY name ASC
        `).all()

        return {
            repositories,
        }
    })

    // Get repository by ID
    wsManager.api.get('/api/repositories/:id', async(_ctx, _req) => {
        const repoId = req.params.param0

        const repo = db.prepare('SELECT * FROM repositories WHERE id = ?').get(repoId)

        if (!repo) {
            throw new Error('Repository not found')
        }

        return {
            repository: repo,
        }
    })

    // Discover local git repositories
    wsManager.api.post('/api/repositories/discover', async(_ctx, _req) => {
        const {searchPath} = req.data as {searchPath?: string}

        const searchDir = searchPath || process.cwd()
        const discovered: Array<{name: string; path: string}> = []

        // Limit depth to avoid scanning too deep
        async function scanDirectory(dir: string, depth = 0) {
            if (depth > 3) return

            try {
                const entries = await fs.readdir(dir, {withFileTypes: true})

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name)

                    // Check if this is a git repository
                    if (entry.isDirectory() && entry.name === '.git') {
                        const repoPath = path.dirname(fullPath)
                        const repoName = path.basename(repoPath)
                        discovered.push({
                            name: repoName,
                            path: repoPath,
                        })
                        continue
                    }

                    // Recursively scan subdirectories (skip node_modules, .git, etc.)
                    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                        await scanDirectory(fullPath, depth + 1)
                    }
                }
            } catch (error) {
                // Skip directories we can't read
                logger.debug(`[API] Could not scan directory ${dir}: ${error}`)
            }
        }

        await scanDirectory(searchDir)

        return {
            discovered,
        }
    })

    // Add repository
    wsManager.api.post('/api/repositories', async(_ctx, _req) => {
        const {config, name, path: repoPath, platform, remote_url} = req.data as {
            config?: Record<string, unknown>
            name: string
            path: string
            platform?: 'github' | 'gitlab' | 'local'
            remote_url?: string
        }

        if (!name || !repoPath) {
            throw new Error('name and path are required')
        }

        // Verify path exists and is a git repository
        const gitPath = path.join(repoPath, '.git')
        if (!await fs.pathExists(gitPath)) {
            throw new Error('Path is not a git repository')
        }

        const repoId = randomId()
        const now = Date.now()
        const repoPlatform = platform || getDefaultPlatform()

        db.prepare(`
            INSERT INTO repositories (
                id, name, path, platform, remote_url, config, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            repoId,
            name,
            repoPath,
            repoPlatform,
            remote_url || null,
            JSON.stringify(config || {}),
            now,
            now,
        )

        const repository = db.prepare('SELECT * FROM repositories WHERE id = ?').get(repoId)

        // Broadcast repository creation
        wsManager.broadcast('/repositories', {
            repository,
            type: 'repository:created',
        })

        logger.info(`[API] Added repository ${repoId}: ${name}`)

        return {
            repository,
        }
    })

    // Update repository
    wsManager.api.put('/api/repositories/:id', async(_ctx, _req) => {
        const repoId = req.params.param0
        const updates = req.data as Partial<{
            config: Record<string, unknown>
            name: string
            path: string
            platform: string
            remote_url: string
        }>

        const fields: string[] = []
        const values: unknown[] = []

        if (updates.name !== undefined) {
            fields.push('name = ?')
            values.push(updates.name)
        }
        if (updates.path !== undefined) {
            fields.push('path = ?')
            values.push(updates.path)
        }
        if (updates.platform !== undefined) {
            fields.push('platform = ?')
            values.push(updates.platform)
        }
        if (updates.remote_url !== undefined) {
            fields.push('remote_url = ?')
            values.push(updates.remote_url)
        }
        if (updates.config !== undefined) {
            fields.push('config = ?')
            values.push(JSON.stringify(updates.config))
        }

        if (fields.length === 0) {
            throw new Error('No fields to update')
        }

        fields.push('updated_at = ?')
        values.push(Date.now())
        values.push(repoId)

        db.prepare(`
            UPDATE repositories
            SET ${fields.join(', ')}
            WHERE id = ?
        `).run(...values)

        const repository = db.prepare('SELECT * FROM repositories WHERE id = ?').get(repoId)

        // Broadcast repository update
        wsManager.broadcast('/repositories', {
            repository,
            type: 'repository:updated',
        })

        return {
            repository,
        }
    })

    // Delete repository
    wsManager.api.delete('/api/repositories/:id', async(_ctx, _req) => {
        const repoId = req.params.param0

        db.prepare('DELETE FROM repositories WHERE id = ?').run(repoId)

        // Broadcast repository deletion
        wsManager.broadcast('/repositories', {
            repositoryId: repoId,
            type: 'repository:deleted',
        })

        logger.info(`[API] Deleted repository ${repoId}`)

        return {
            success: true,
        }
    })

    // Subscribe to repository updates
    wsManager.on('/repositories', (_ws) => {
        logger.debug('[API] Client subscribed to repository updates')
    })
}
