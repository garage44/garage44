import {enola, logger, workspaces} from '../service.ts'
import {api} from '../lib/ws-server.ts'
import {config} from '../lib/config.ts'
import fs from 'fs/promises'
import os from 'node:os'
import path from 'node:path'

import {syncLanguage} from '../lib/sync.ts'

interface WorkspaceConfig {
    translator: unknown
    // Add other properties as needed
}

interface Workspace {
    config: WorkspaceConfig
}

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

export default async function(app) {
    app.get('/api/workspaces/:workspace_id/usage', async(req, res) => {
        const workspace = workspaces.get(req.params.workspace_id) as Workspace
        const usage = await enola.usage(workspace.config.translator)
        res.json(usage)
    })

    api.get('/api/workspaces/browse', async(context, request) => {
        try {
            const startPath = request.data?.path as string || os.homedir()
            let workspace = null

            const currentIsWorkspace = await fs.access(path.join(startPath, '.expressio.json'))
                .then(() => true)
                .catch(() => false)

            if (currentIsWorkspace) {
                const configContent = await fs.readFile(path.join(startPath, '.expressio.json'), 'utf-8')
                const workspaceSettings = JSON.parse(configContent)
                workspace = {
                    source_file: path.join(startPath, '.expressio.json'),
                    status: 'existing',
                    workspace_id: workspaceSettings.config.workspace_id,
                }
            }

            const contents = await fs.readdir(startPath, {withFileTypes: true})

            const directories = await Promise.all(contents
                .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
                .map(async dirent => {
                    const dirPath = path.join(startPath, dirent.name)
                    const isWorkspace = await fs.access(path.join(dirPath, '.expressio.json'))
                        .then(() => true)
                        .catch(() => false)

                    return {
                        is_workspace: isWorkspace,
                        name: dirent.name,
                        path: dirPath,
                    }
                }))

            return {
                current: {
                    path: startPath,
                    workspace,
                },
                directories,
                parent: path.dirname(startPath),
            }
        } catch (err) {
            if (err instanceof Error) {
                throw new Error(err.message)
            }
            throw new Error('Unknown error occurred')
        }
    }, [requireAdmin])

    api.get('/api/workspaces/:workspace_id', async(context, req) => {
        const workspace = workspaces.get(req.params.workspace_id)
        if (!workspace) {
            return {error: 'Workspace not found'}
        }
        return {
            config: workspace.config,
            i18n: workspace.i18n,
        }
    })

    app.post('/api/workspaces/:workspace_id', async(req, res) => {
        const workspace_data = req.body.workspace

        const workspace = workspaces.get(req.params.workspace_id)
        const target_languages = workspace.config.languages.target

        // The languages we have selected in the new situation.
        const selectedLanguages = workspace_data.config.languages.target

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

        Object.assign(workspace.config, workspace_data.config)
        workspace.save()
        return res.json({languages: workspace.config.languages})
    })

    app.delete('/api/workspaces/:workspace_id', async(req, res) => {
        logger.info(`Deleting workspace: ${req.params.workspace_id}`)
        await workspaces.delete(req.params.workspace_id)

        return res.json({
            message: 'ok',
        })
    })

    app.post('/api/workspaces', async(req, res) => {
        try {
            const workspace = await workspaces.add(req.body.path)

            return res.json({
                workspace: workspace.config,
            })
        } catch (err) {
            logger.error(`Failed to add workspace: ${err}`)
            return res.status(400).json({error: err.message})
        }
    })
}
