import {config, saveConfig} from '../lib/config.ts'
import {enola, logger, workspaces} from '../service.ts'

export default async function(app) {

    app.get('/api/config', async(req, res) => {
        const user = config.users.find((i) => i.name === req.session.userid)
        return res.json({
            enola: enola.getConfig(user.admin),
            language_ui: config.language_ui,
            workspaces: workspaces.workspaces.map((workspace) => ({
                source_file: workspace.config.source_file,
                workspace_id: workspace.config.workspace_id,
            })),
        })
    })

    app.post('/api/config', async(req, res) => {
        const user = config.users.find((i) => i.name === req.session.userid)
        if (!user.admin) {
            return res.status(403).json({error: 'Unauthorized'})
        }

        config.enola = req.body.enola

        for (const engine of Object.values(config.enola.engines)) {
            if (engine.api_key) {
                enola.engines[engine.name].activate(engine)
            } else if (enola.engines[engine.name].config.active) {
                enola.engines[engine.name].deactivate()
            }
        }

        config.language_ui = req.body.language_ui

        // Get workspace names from request
        const requestedWorkspaceIds = req.body.workspaces.map(w => w.workspace_id)
        // Find workspaces that need to be removed
        const redundantWorkspaces = workspaces.workspaces.filter(
            w => !requestedWorkspaceIds.includes(w.config.workspace_id),
        )

        // Remove redundant workspaces
        for (const workspace of redundantWorkspaces) {
            logger.info(`[api] [settings] removing redundant workspace ${workspace.config.workspace_id}`)
            await workspaces.delete(workspace.config.workspace_id)
        }
        // Add missing workspaces
        for (const description of req.body.workspaces) {
            if (!workspaces.get(description.workspace_id)) {
                await workspaces.add(description)
            }
        }

        await saveConfig()

        return res.json({
            enola: enola.config,
            language_ui: config.language_ui,
            workspaces: workspaces.workspaces.map((workspace) => ({
                source_file: workspace.config.source_file,
                workspace_id: workspace.config.workspace_id,
            })),
        })
    })
}
