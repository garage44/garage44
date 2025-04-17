import {logger, runtime} from '../service.ts'
import apiConfig from '../api/config.ts'
import apiI18n from '../api/i18n.ts'
import apiProfile from '../api/profile.ts'
import apiWorkspaces from '../api/workspaces'
import {commonMiddleware} from '@garage44/common/lib/middleware'
import {config} from '../lib/config.ts'
import express from 'express'
import path from 'node:path'

export async function initMiddleware(app, bunchyConfig) {
    commonMiddleware(app, logger, config, bunchyConfig)
    apiI18n(app)
    apiConfig(app)
    apiProfile(app)
    apiWorkspaces(app)

    const publicPath = path.join(runtime.service_dir, 'public')
    // Serve static files from public directory
    app.use('/public', express.static(publicPath))

    // Serve index.html for all other routes (SPA fallback)
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'))
    })
}
