import {createMiddleware, createFinalHandler} from '@garage44/common/lib/middleware'
import {devContext} from '@garage44/common/lib/dev-context'
import {logger, runtime} from '../service.ts'
import apiConfig from '../api/config.ts'
import apiI18n from '../api/i18n.ts'
import apiProfile from '../api/profile.ts'
import apiWorkspaces from '../api/workspaces'
import {getUserByUsername} from './user.ts'
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

// Create unified middleware for Expressio
const unifiedMiddleware = createMiddleware({
    endpointAllowList: ['/api/context', '/api/translations', '/api/login'],
    getUserByUsername,
    packageName: 'expressio',
    sessionCookieName: 'expressio-session',
})

// Auth middleware that can be reused across workspace routes
const requireAdmin = async (ctx, next) => {
    if (!ctx.session?.userid) {
        throw new Error('Unauthorized')
    }

    const {getUserByUsername} = await import('./user.ts')
    const user = await getUserByUsername(ctx.session.userid)
    if (!user?.permissions.admin) {
        throw new Error('Unauthorized')
    }
    // Add user to context for handlers
    ctx.user = user
    return next(ctx)
}


async function initMiddleware(_bunchyConfig) {
    const router = new Router()

    // Register HTTP API endpoints using familiar Express-like pattern
    await apiI18n(router)
    await apiConfig(router)
    await apiProfile(router)
    await apiWorkspaces(router)

    const publicPath = path.join(runtime.service_dir, 'public')

    // Create unified final handler
    const finalHandleRequest = createFinalHandler({
        customWebSocketHandlers: undefined,
        devContext,
        endpointAllowList: ['/api/context', '/api/translations', '/api/login'],
        getUserByUsername,
        logger,
        packageName: 'expressio',
        publicPath,
        router,
        sessionCookieName: 'expressio-session',
    })

    return {
        handleRequest: finalHandleRequest,
        handleWebSocket: unifiedMiddleware.handleWebSocket,
    }
}

export {
    initMiddleware,
    requireAdmin,
}