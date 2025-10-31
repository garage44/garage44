import {createFinalHandler} from '@garage44/common/lib/middleware'
import {adminContext, deniedContext, userContext} from '@garage44/common/lib/profile.ts'
import {createAvatarRoutes} from '@garage44/common/lib/avatar-routes'
import {devContext} from '@garage44/common/lib/dev-context'
import {userManager} from '@garage44/common/service'
import {logger, runtime} from '../service.ts'
import apiConfig from '../api/config.ts'
import apiI18n from '../api/i18n.ts'
import apiWorkspaces from '../api/workspaces'
import path from 'node:path'

// Simple HTTP router for Bun.serve that mimics Express pattern
class Router {
    routes: {handler: (req: Request, params: Record<string, string>, session?: any) => Promise<Response>; method: string; path: RegExp}[] = []

    get(path: string, handler: (req: Request, params: Record<string, string>, session?: any) => Promise<Response>) {
        this.add('GET', path, handler)
    }

    post(path: string, handler: (req: Request, params: Record<string, string>, session?: any) => Promise<Response>) {
        this.add('POST', path, handler)
    }

    put(path: string, handler: (req: Request, params: Record<string, string>, session?: any) => Promise<Response>) {
        this.add('PUT', path, handler)
    }

    delete(path: string, handler: (req: Request, params: Record<string, string>, session?: any) => Promise<Response>) {
        this.add('DELETE', path, handler)
    }

    private add(method: string, path: string, handler: (req: Request, params: Record<string, string>, session?: any) => Promise<Response>) {
        // Convert path params (e.g. /api/workspaces/:id) to regex
        const regex = new RegExp('^' + path.replaceAll(/:[^/]+/g, '([^/]+)') + '$')
        this.routes.push({
            handler,
            method,
            path: regex,
        })
    }

    async route(req: Request, session?: Record<string, string>): Promise<Response | null> {
        const url = new URL(req.url)
        const pathname = url.pathname
        for (const {handler, method, path} of this.routes) {
            if (req.method === method && path.test(pathname)) {
                // Extract params
                const paramValues = pathname.match(path)?.slice(1) || []
                const params: Record<string, string> = {}
                paramValues.forEach((val, idx) => {
                    params[`param${idx}`] = val
                })
                return await handler(req, params, session)
            }
        }
        return null
    }
}


// Auth middleware that can be reused across workspace routes
const requireAdmin = async (ctx, next) => {
    if (!ctx.session?.userid) {
        throw new Error('Unauthorized')
    }

    // User lookup will be handled by middleware's UserManager
    // The authentication check is done by the middleware layer
    return next(ctx)
}


async function initMiddleware(_bunchyConfig) {
    const router = new Router()

    // Register common avatar routes (placeholder images and uploaded avatars)
    const avatarRoutes = createAvatarRoutes({
        appName: 'expressio',
        logger,
        runtime,
    })
    avatarRoutes.registerPlaceholderRoute(router)
    avatarRoutes.registerAvatarRoute(router)

    // Register HTTP API endpoints using familiar Express-like pattern
    await apiI18n(router)
    await apiConfig(router)
    await apiWorkspaces(router)

    const publicPath = path.join(runtime.service_dir, 'public')

    // Create unified final handler with built-in authentication API
    const finalHandleRequest = createFinalHandler({
        configPath: '~/.expressiorc',
        contextFunctions: {
            adminContext,
            deniedContext,
            userContext,
        },
        customWebSocketHandlers: undefined,
        devContext,
        endpointAllowList: ['/api/translations', '/api/login'],
        logger,
        mimeTypes: undefined,
        packageName: 'expressio',
        publicPath,
        router,
        sessionCookieName: 'expressio-session',
        userManager,
    })

    return {
        handleRequest: finalHandleRequest,
        handleWebSocket: () => {}, // WebSocket handling is done in common middleware
    }
}

export {
    initMiddleware,
    requireAdmin,
}