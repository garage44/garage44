import {enola, logger, workspaces} from '../service.ts'
import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {config} from '../lib/config.ts'
import fs from 'fs/promises'
import path from 'node:path'

import {syncLanguage} from '../lib/sync.ts'

export function registerWorkspacesWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    // WebSocket API routes (unchanged) - these are for real-time features
    const api = wsManager.api
    api.get('/api/workspaces/browse', async(context, request) => {
        // Determine the path to browse
        const reqPath = request.data?.path || process.cwd() as any
        const absPath = path.isAbsolute(reqPath) ? reqPath : path.resolve(process.cwd(), reqPath)

        // List directories
        let entries: any[] = []
        try {
            const dirents = await fs.readdir(absPath, { withFileTypes: true })
            entries = await Promise.all(dirents.filter(d => d.isDirectory()).map((dirent) => {
                const dirPath = path.join(absPath, dirent.name)
                // Check if this directory is a workspace root
                const is_workspace = workspaces.workspaces.some(ws => path.dirname(ws.config.source_file) === dirPath)
                return {
                    is_workspace,
                    name: dirent.name,
                    path: dirPath,
                }
            }))
        } catch (error) {
            logger.error(`[api] Failed to list directory: ${absPath} - ${error}`)
        }

        // Find parent path
        const parent = path.dirname(absPath)
        // Find current workspace if any
        const currentWorkspace = workspaces.workspaces.find(ws => path.dirname(ws.config.source_file) === absPath) || null

        return {
            current: {
                path: absPath,
                workspace: currentWorkspace ? {
                    config: currentWorkspace.config,
                    id: currentWorkspace.config.workspace_id,
                } : null,
            },
            directories: entries,
            parent,
        }
    })

    api.get('/api/workspaces/:workspace_id', (context, req) => {
        const workspaceId = req.params.workspace_id
        const ws = workspaces.get(workspaceId)
        if (!ws) {
            throw new Error(`Workspace not found: ${workspaceId}`)
        }
        // Only return serializable fields
        return {
            config: ws.config,
            // oxlint-disable-next-line prefer-structured-clone
            i18n: ws.i18n ? JSON.parse(JSON.stringify(ws.i18n)) : undefined,
            id: ws.config.workspace_id,
        }
    })
}

// Default export for backward compatibility
export default function apiWorkspaces(router: any) {
    // HTTP API endpoints using familiar Express-like pattern
    router.get('/api/workspaces/:workspace_id/usage', async () => {
        // Get the first available engine for usage
        const engine = Object.keys(config.enola.engines)[0] || 'deepl'
        const usage = await enola.usage(engine)
        return new Response(JSON.stringify(usage), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.post('/api/workspaces/:workspace_id', async (req: any, params: any) => {
        const workspaceId = params.param0
        const workspace_data = await req.json()

        const workspace = workspaces.get(workspaceId)
        const target_languages = workspace.config.languages.target

        // The languages we have selected in the new situation.
        const selectedLanguages = workspace_data.workspace.config.languages.target

        const currentLanguageIds = target_languages.map((language) => language.id)
        const selectedLanguageIds = selectedLanguages.map((language) => language.id)
        // The languages not yet in our settings
        const addLanguages = selectedLanguages.filter((language) => !currentLanguageIds.includes(language.id))
        const updateLanguages = selectedLanguages
            .filter((language) => currentLanguageIds.includes(language.id))
            .filter((language) => {
                const currentLanguage = target_languages.find((targetLang) => targetLang.id === language.id)
                return currentLanguage.formality !== language.formality
            })

        const removeLanguages = target_languages.filter((language) => !selectedLanguageIds.includes(language.id))
        for (const language of removeLanguages) {
            logger.info(`sync: remove language ${language.id}`)
            await syncLanguage(workspace, language, 'remove')
        }

        await Promise.all([...updateLanguages, ...addLanguages].map((language) => {
            logger.info(`sync: (re)translate language ${language.id}`)
            return syncLanguage(workspace, language, 'update')
        }))

        Object.assign(workspace.config, workspace_data.workspace.config)
        workspace.save()
        return new Response(JSON.stringify({languages: workspace.config.languages}), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.delete('/api/workspaces/:workspace_id', async (req: any, params: any) => {
        const workspaceId = params.param0
        logger.info(`Deleting workspace: ${workspaceId}`)
        await workspaces.delete(workspaceId)

        return new Response(JSON.stringify({message: 'ok'}), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.post('/api/workspaces', async (req: any) => {
        try {
            const body = await req.json()
            const workspace = await workspaces.add(body.path)

            return new Response(JSON.stringify({workspace: workspace.config}), {
                headers: { 'Content-Type': 'application/json' }
            })
        } catch (error) {
            logger.error(`Failed to add workspace: ${error}`)
            return new Response(JSON.stringify({error: error.message}), {
                headers: {'Content-Type': 'application/json'},
                status: 400,
            })
        }
    })
}
