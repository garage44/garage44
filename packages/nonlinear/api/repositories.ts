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
    wsManager.api.get('/api/repositories/:id', async(_ctx, req) => {
        const repoId = req.params.id

        const repo = db.prepare('SELECT * FROM repositories WHERE id = ?').get(repoId)

        if (!repo) {
            throw new Error('Repository not found')
        }

        return {
            repository: repo,
        }
    })

    // Discover local git repositories
    wsManager.api.post('/api/repositories/discover', async(_ctx, req) => {
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
            } catch(error) {
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
    wsManager.api.post('/api/repositories', async(_ctx, req) => {
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
    wsManager.api.put('/api/repositories/:id', async(_ctx, req) => {
        const repoId = req.params.id
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
    wsManager.api.delete('/api/repositories/:id', async(_ctx, req) => {
        const repoId = req.params.id

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

export default function apiRepositories(router: unknown) {
    const routerTyped = router as {
        delete: (
            path: string,
            handler: (req: Request, params: Record<string, string>, session: unknown) => Promise<Response>,
        ) => void
        get: (
            path: string,
            handler: (req: Request, params: Record<string, string>, session: unknown) => Promise<Response>,
        ) => void
        post: (
            path: string,
            handler: (req: Request, params: Record<string, string>, session: unknown) => Promise<Response>,
        ) => void
        put: (
            path: string,
            handler: (req: Request, params: Record<string, string>, session: unknown) => Promise<Response>,
        ) => void
    }

    routerTyped.get('/api/repositories', async(_req: Request, _params: Record<string, string>, _session: unknown) => {
        const repositories = db.prepare(`
            SELECT * FROM repositories
            ORDER BY name ASC
        `).all()

        return new Response(JSON.stringify({repositories}), {
            headers: {'Content-Type': 'application/json'},
        })
    })

    routerTyped.get('/api/repositories/:id', async(_req: Request, params: Record<string, string>, _session: unknown) => {
        const repoId = params.id

        const repo = db.prepare('SELECT * FROM repositories WHERE id = ?').get(repoId)

        if (!repo) {
            return new Response(JSON.stringify({error: 'Repository not found'}), {
                headers: {'Content-Type': 'application/json'},
                status: 404,
            })
        }

        return new Response(JSON.stringify({repository: repo}), {
            headers: {'Content-Type': 'application/json'},
        })
    })

    routerTyped.post('/api/repositories', async(req: Request, _params: Record<string, string>, _session: unknown) => {
        try {
            const body = await req.json() as {
                config?: Record<string, unknown>
                name: string
                path: string
                platform?: 'github' | 'gitlab' | 'local'
                remote_url?: string
            }

            const {config, name, path: repoPath, platform, remote_url} = body

            if (!name || !repoPath) {
                return new Response(JSON.stringify({error: 'name and path are required'}), {
                    headers: {'Content-Type': 'application/json'},
                    status: 400,
                })
            }

            // Verify path exists and is a git repository
            const gitPath = path.join(repoPath, '.git')
            if (!await fs.pathExists(gitPath)) {
                return new Response(JSON.stringify({error: 'Path is not a git repository'}), {
                    headers: {'Content-Type': 'application/json'},
                    status: 400,
                })
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

            logger.info(`[API] Added repository ${repoId}: ${name}`)

            return new Response(JSON.stringify({repository}), {
                headers: {'Content-Type': 'application/json'},
            })
        } catch(error) {
            logger.error(`[API] Error adding repository: ${error}`)
            return new Response(JSON.stringify({error: error instanceof Error ? error.message : 'Failed to add repository'}), {
                headers: {'Content-Type': 'application/json'},
                status: 500,
            })
        }
    })

    routerTyped.put('/api/repositories/:id', async(req: Request, params: Record<string, string>, _session: unknown) => {
        try {
            const repoId = params.id
            const body = await req.json() as Partial<{
                config: Record<string, unknown>
                name: string
                path: string
                platform: string
                remote_url: string
            }>

            const fields: string[] = []
            const values: unknown[] = []

            if (body.name !== undefined) {
                fields.push('name = ?')
                values.push(body.name)
            }
            if (body.path !== undefined) {
                fields.push('path = ?')
                values.push(body.path)
            }
            if (body.platform !== undefined) {
                fields.push('platform = ?')
                values.push(body.platform)
            }
            if (body.remote_url !== undefined) {
                fields.push('remote_url = ?')
                values.push(body.remote_url)
            }
            if (body.config !== undefined) {
                fields.push('config = ?')
                values.push(JSON.stringify(body.config))
            }

            if (fields.length === 0) {
                return new Response(JSON.stringify({error: 'No fields to update'}), {
                    headers: {'Content-Type': 'application/json'},
                    status: 400,
                })
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

            return new Response(JSON.stringify({repository}), {
                headers: {'Content-Type': 'application/json'},
            })
        } catch(error) {
            logger.error(`[API] Error updating repository: ${error}`)
            return new Response(JSON.stringify({error: error instanceof Error ? error.message : 'Failed to update repository'}), {
                headers: {'Content-Type': 'application/json'},
                status: 500,
            })
        }
    })

    routerTyped.delete('/api/repositories/:id', async(_req: Request, params: Record<string, string>, _session: unknown) => {
        const repoId = params.id

        db.prepare('DELETE FROM repositories WHERE id = ?').run(repoId)

        logger.info(`[API] Deleted repository ${repoId}`)

        return new Response(JSON.stringify({success: true}), {
            headers: {'Content-Type': 'application/json'},
        })
    })
}
