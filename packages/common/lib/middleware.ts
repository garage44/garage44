import cookieParser from 'cookie-parser'
import express from 'express'
import expressWinston from 'express-winston'
import path from 'node:path'
import sessions from 'express-session'
// These endpoints are allowed to bypass the authentication middleware:
const endpointAllowList = [
    '/api/context',
    '/api/translations',
    '/api/login',
]

// Private variable to hold the singleton instance
let sessionInstance = null

// Singleton factory that ensures the same instance is returned
export const getSession = (config) => {
    if (!sessionInstance && config) {
        sessionInstance = sessions(config.session)
    }
    return sessionInstance
}

export function authMiddleware(config) {
    return async function authMiddleware(req, res, next) {
        if (!req.url.startsWith('/api')) {
            next()
            return
        }

        const session = req.session

        if (endpointAllowList.find((i) => req.originalUrl.includes(i))) {
            next()
        } else if (session.userid) {
            const users = config.users
            const user = users.find((i) => i.name === session.userid)
            if (user) {
                next()
            } else {
                res.status(401).send('Unauthorized')
            }
        } else {
            if (process.env.GARAGE44_NO_SECURITY) {
                // Find the first admin user and set their userid in the session
                const adminUser = config.users.find(user => user.admin)
                if (adminUser) {
                    session.userid = adminUser.name
                }
                next()
            } else {
                res.status(401).send('Unauthorized')
            }
        }
    }
}

export async function commonMiddleware(app, logger, config, bunchyConfig) {
    app.use(expressWinston.logger({
        colorize: true,
        expressFormat: true,
        meta: false,
        winstonInstance: logger,
    }))

    app.use(cookieParser())
    app.use(getSession(config))
    app.use(authMiddleware(config))
    if (process.env.BUN_ENV === 'development') {
        app.use('/common', express.static(path.join(bunchyConfig.common)))
        app.use('/src', express.static(path.join(bunchyConfig.workspace, 'src')))
    }
}
