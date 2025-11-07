import {pathCreate, pathDelete, pathMove, pathRef, pathToggle} from '@garage44/common/lib/paths.ts'
import {translate_path, translate_tag} from '../lib/translate.ts'
import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {i18nFormat} from '@garage44/expressio/lib/i18n'
import {logger} from '@garage44/common/app'
import {workspaces} from '../service.ts'

export function registerI18nWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    // WebSocket API routes (unchanged) - these are for real-time features
    const apiWs = wsManager.api

    // oxlint-disable-next-line require-await
    apiWs.post('/api/workspaces/:workspace_id/paths', async(_context, request) => {
        const {workspace_id} = request.params
        const workspace = workspaces.get(workspace_id)
        const {path, value} = request.data as {path: string[]; value: any}
        pathCreate(workspace.i18n, path, value, workspace.config.languages.target)
        workspace.save()
    })

    // oxlint-disable-next-line require-await
    apiWs.delete('/api/workspaces/:workspace_id/paths', async(_context, request) => {
        const {workspace_id} = request.params
        const workspace = workspaces.get(workspace_id)
        const path = request.data.path as string
        pathDelete(workspace.i18n, path)
        workspace.save()
    })

    // oxlint-disable-next-line require-await
    apiWs.put('/api/workspaces/:workspace_id/paths', async(_context, request) => {
        const {workspace_id} = request.params
        const workspace = workspaces.get(workspace_id)
        const {new_path, old_path} = request.data
        pathMove(workspace.i18n, old_path, new_path)
        workspace.save()
    })
    // oxlint-disable-next-line require-await
    apiWs.post('/api/workspaces/:workspace_id/collapse', async(_context, request) => {
        const {workspace_id} = request.params
        const {path, tag_modifier, value} = request.data as {path: string[]; tag_modifier?: boolean; value?: any}
        const workspace = workspaces.get(workspace_id)

        // Determine which mode to use based on the request
        const mode = (tag_modifier || (value && value._collapsed === true)) ? 'all' : 'groups'

        // Use new pathToggle signature with explicit mode string
        pathToggle(workspace.i18n, path, value, mode as 'all' | 'groups')

        workspace.save()
    })

    // oxlint-disable-next-line require-await
    apiWs.post('/api/workspaces/:workspace_id/tags', async(_context, request) => {
        const {workspace_id} = request.params
        const workspace = workspaces.get(workspace_id)
        const {path, source} = request.data
        const {id, ref} = pathRef(workspace.i18n, path)
        ref[id].source = source
        workspace.save()
    })

    apiWs.post('/api/workspaces/:workspace_id/translate', async(_context, request) => {
        const workspace = workspaces.get(request.params.workspace_id)

        const {ignore_cache, path, value} = request.data

        // Expand the path to ensure it's visible in the UI
        pathToggle(workspace.i18n, path, {_collapsed: false}, 'all' as const)

        if (value) {
            const sourceText = value.source
            const persist = !value._soft

            try {
                const result = await translate_tag(workspace, path, sourceText, persist)
                workspace.save()

                // Return proper translation result for UI feedback
                return {
                    cached: [],
                    success: true,
                    targets: [result],
                    translations: workspace.config.languages.target.map(lang =>
                        result.ref[result.id].target[lang.id]
                    ),
                }
            } catch (error) {
                logger.error('Translation error:', error)
                return {
                    cached: [],
                    error: error.message,
                    success: false,
                    targets: [],
                    translations: [],
                }
            }
        } else {
            try {
                const {cached, targets, translations} = await translate_path(workspace, path, ignore_cache)
                workspace.save()
                return {cached, success: true, targets, translations}
            } catch (error) {
                logger.error('Translation error:', error)
                return {
                    cached: [],
                    error: error.message,
                    success: false,
                    targets: [],
                    translations: [],
                }
            }
        }
    })

    // oxlint-disable-next-line require-await
    apiWs.post('/api/workspaces/:workspace_id/undo', async (_context, request) => {
        const workspace = workspaces.get(request.params.workspace_id)
        workspace.undo()
    })

    // oxlint-disable-next-line require-await
    apiWs.post('/api/workspaces/:workspace_id/redo', async (_context, request) => {
        const workspace = workspaces.get(request.params.workspace_id)
        workspace.redo()
    })
}

// Default export for backward compatibility
export default function apiI18n(router: any) {
    // HTTP API endpoints using familiar Express-like pattern
    router.get('/api/workspaces/:workspace_id/translations', (req: any, params: any) => {
        const workspaceId = params.param0 // Extract workspace_id from path params
        const workspace = workspaces.get(workspaceId)
        return new Response(JSON.stringify(i18nFormat(workspace.i18n, workspace.config.languages.target)), {
            headers: {'Content-Type': 'application/json'},
        })
    })
}
