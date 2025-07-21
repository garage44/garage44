import {config, saveConfig} from '../lib/config.ts'
import {enola, logger, workspaces} from '../service.ts'

export default function apiConfig(router) {
    // HTTP API endpoints using familiar Express-like pattern
    router.get('/api/config', () => {
        // For now, assume admin user since we don't have session context here
        // In a real implementation, you'd get the user from the session
        const user = config.users.find((i) => i.name === 'admin')
        return new Response(JSON.stringify({
            enola: enola.getConfig(user.admin),
            language_ui: config.language_ui,
            workspaces: workspaces.workspaces.map((workspace) => ({
                source_file: workspace.config.source_file,
                workspace_id: workspace.config.workspace_id,
            })),
        }), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.post('/api/config', async (req) => {
        // For now, assume admin user since we don't have session context here
        const user = config.users.find((user) => user.name === 'admin')
        if (!user.admin) {
            return new Response(JSON.stringify({error: 'Unauthorized'}), {
                headers: { 'Content-Type': 'application/json' },
                status: 403,
            })
        }

        const body = await req.json()
        config.enola = body.enola

        for (const [engineName, engine] of Object.entries(config.enola.engines)) {
            const engineConfig = engine as any
            if (engineConfig.api_key && enola.engines[engineName] && typeof enola.engines[engineName].init === 'function') {
                await enola.engines[engineName].init(engineConfig, logger)
            }
        }

        config.language_ui = body.language_ui

        // Get workspace names from request
        const requestedWorkspaceIds = body.workspaces.map(w => w.workspace_id)
        // Find workspaces that need to be removed
        const redundantWorkspaces = workspaces.workspaces.filter(
            workspace => !requestedWorkspaceIds.includes(workspace.config.workspace_id),
        )

        // Remove redundant workspaces
        for (const workspace of redundantWorkspaces) {
            logger.info(`[api] [settings] removing redundant workspace ${workspace.config.workspace_id}`)
            await workspaces.delete(workspace.config.workspace_id)
        }
        // Add missing workspaces
        for (const description of body.workspaces) {
            if (!workspaces.get(description.workspace_id)) {
                await workspaces.add(description)
            }
        }

        await saveConfig()

        return new Response(JSON.stringify({
            enola: enola.config,
            language_ui: config.language_ui,
            workspaces: workspaces.workspaces.map((workspace) => ({
                source_file: workspace.config.source_file,
                workspace_id: workspace.config.workspace_id,
            })),
        }), {
            headers: { 'Content-Type': 'application/json' }
        })
    })
}
