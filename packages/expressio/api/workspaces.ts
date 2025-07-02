import {enola, logger, workspaces} from '../service.ts'
import {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {config} from '../lib/config.ts'
import fs from 'fs/promises'
import os from 'node:os'
import path from 'node:path'

import {syncLanguage} from '../lib/sync.ts'

// Auth middleware that can be reused across workspace routes
const requireAdmin = async(ctx, next) => {
    const user = config.users.find((i) => i.name === ctx.session?.userid)
    if (!user?.admin) {
        throw new Error('Unauthorized')
    }
    // Add user to context for handlers
    ctx.user = user
    return next(ctx)
}

export function registerWorkspacesWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    // WebSocket API routes (unchanged) - these are for real-time features
    const api = wsManager.api
    api.get('/api/workspaces/browse', async(context, request) => {
        // Determine the path to browse
        const reqPath = request.data?.path || process.cwd()
        const absPath = path.isAbsolute(reqPath) ? reqPath : path.resolve(process.cwd(), reqPath)

        // List directories
        let entries: any[] = []
        try {
            const dirents = await fs.readdir(absPath, { withFileTypes: true })
            entries = await Promise.all(dirents.filter(d => d.isDirectory()).map(async (dirent) => {
                const dirPath = path.join(absPath, dirent.name)
                // Check if this directory is a workspace root
                const is_workspace = workspaces.workspaces.some(ws => path.dirname(ws.config.source_file) === dirPath)
                return {
                    name: dirent.name,
                    path: dirPath,
                    is_workspace,
                }
            }))
        } catch (err) {
            logger.error(`[api] Failed to list directory: ${absPath} - ${err}`)
        }

        // Find parent path
        const parent = path.dirname(absPath)
        // Find current workspace if any
        const currentWorkspace = workspaces.workspaces.find(ws => path.dirname(ws.config.source_file) === absPath) || null

        return {
            current: {
                path: absPath,
                workspace: currentWorkspace ? {
                    id: currentWorkspace.config.workspace_id,
                    config: currentWorkspace.config,
                } : null,
            },
            directories: entries,
            parent,
        }
    })

    api.get('/api/workspaces/:workspace_id', async(context, req) => {
        const workspaceId = req.params.workspace_id
        const ws = workspaces.get(workspaceId)
        if (!ws) {
            throw new Error(`Workspace not found: ${workspaceId}`)
        }
        // Only return serializable fields
        return {
            id: ws.config.workspace_id,
            config: ws.config,
            i18n: ws.i18n ? JSON.parse(JSON.stringify(ws.i18n)) : undefined,
        }
    })
}

// Default export for backward compatibility
export default function(router: any) {
    // HTTP API endpoints using familiar Express-like pattern
    router.get('/api/workspaces/:workspace_id/usage', async (req: any, params: any, session: any) => {
        const workspaceId = params.param0 // Extract workspace_id from path params
        const workspace = workspaces.get(workspaceId)
        // Get the first available engine for usage
        const engine = Object.keys(config.enola.engines)[0] || 'deepl'
        const usage = await enola.usage(engine)
        return new Response(JSON.stringify(usage), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.post('/api/workspaces/:workspace_id', async (req: any, params: any, session: any) => {
        const workspaceId = params.param0
        const workspace_data = await req.json()

        const workspace = workspaces.get(workspaceId)
        const target_languages = workspace.config.languages.target

        // The languages we have selected in the new situation.
        const selectedLanguages = workspace_data.workspace.config.languages.target

        const currentLanguageIds = target_languages.map((i) => i.id)
        const selectedLanguageIds = selectedLanguages.map((i) => i.id)
        // The languages not yet in our settings
        const addLanguages = selectedLanguages.filter((i) => !currentLanguageIds.includes(i.id))

        const updateLanguages = selectedLanguages
            .filter((i) => currentLanguageIds.includes(i.id))
            .filter((i) => {
                const currentLanguage = target_languages.find((j) => j.id === i.id)
                return currentLanguage.formality !== i.formality
            })

        const removeLanguages = target_languages.filter((i) => !selectedLanguageIds.includes(i.id))
        for (const language of removeLanguages) {
            logger.info(`sync: remove language ${language.id}`)
            await syncLanguage(workspace, language, 'remove')
        }

        await Promise.all([...updateLanguages, ...addLanguages].map((language) => {
            logger.info(`sync: (re)translate language ${language.id}`)
            syncLanguage(workspace, language, 'update')
        }))

        Object.assign(workspace.config, workspace_data.workspace.config)
        workspace.save()
        return new Response(JSON.stringify({languages: workspace.config.languages}), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.delete('/api/workspaces/:workspace_id', async (req: any, params: any, session: any) => {
        const workspaceId = params.param0
        logger.info(`Deleting workspace: ${workspaceId}`)
        await workspaces.delete(workspaceId)

        return new Response(JSON.stringify({message: 'ok'}), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.post('/api/workspaces', async (req: any, params: any, session: any) => {
        try {
            const body = await req.json()
            const workspace = await workspaces.add(body.path)

            return new Response(JSON.stringify({workspace: workspace.config}), {
                headers: { 'Content-Type': 'application/json' }
            })
        } catch (err) {
            logger.error(`Failed to add workspace: ${err}`)
            return new Response(JSON.stringify({error: err.message}), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }
    })
}
