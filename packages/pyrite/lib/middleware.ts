import {createMiddleware, createFinalHandler} from '@garage44/common/lib/middleware'
import {devContext} from '@garage44/common/lib/dev-context'
import {logger, runtime} from '../service.ts'
import apiChat from '../api/chat.ts'
import apiDashboard from '../api/dashboard.ts'
import apiGroups from '../api/groups.ts'
import apiI18n from '../api/i18n.ts'
import apiProfile from '../api/profile.ts'
import apiRecordings from '../api/recordings.ts'
import apiUsers from '../api/users.ts'
import {config} from '../lib/config.ts'
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
        // Convert path params (e.g. /api/groups/:id) to regex
        const regex = new RegExp('^' + path.replaceAll(/:[^/]+/g, '([^/]+)') + '$')
        this.routes.push({
            handler,
            method,
            path: regex,
        })
    }

    async route(req: Request, session?: any): Promise<Response | null> {
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

// SFU Proxy - proxies WebSocket connections to Galène
async function proxySFUWebSocket(request: Request, server: any) {
    const sfuUrl = config.sfu.url.replace('http://', 'ws://').replace('https://', 'wss://')
    const url = new URL(request.url)
    const targetUrl = `${sfuUrl}${url.pathname}${url.search}`

    try {
        // Create WebSocket connection to Galène
        const sfuWs = new WebSocket(targetUrl)

        // Upgrade client connection
        const upgraded = server.upgrade(request, {
            data: {
                endpoint: '/sfu',
                sfuWs,
            },
        })

        if (upgraded) {
            return
        }

        return new Response('WebSocket upgrade failed', {status: 400})
    } catch (error) {
        logger.error(`[SFU Proxy] Failed to connect to SFU: ${error}`)
        return new Response('Failed to connect to SFU', {status: 502})
    }
}

// Create unified middleware for Pyrite
const unifiedMiddleware = createMiddleware({
    customWebSocketHandlers: [{
        handler: proxySFUWebSocket,
        path: '/sfu',
    }],
    endpointAllowList: ['/api/context', '/api/i18n', '/api/login', '/api/chat/emoji', '/api/groups/public'],
    getUserByUsername,
    packageName: 'pyrite',
    sessionCookieName: 'pyrite-session',
})

// Auth middleware that can be reused across routes
const requireAdmin = (ctx, next) => {
    const user = config.users.find((user) => user.name === ctx.session?.userid)
    if (!user?.admin) {
        throw new Error('Unauthorized')
    }
    // Add user to context for handlers
    ctx.user = user
    return next(ctx)
}

async function initMiddleware(_bunchyConfig) {
    const router = new Router()

    // Register HTTP API endpoints using familiar Express-like pattern
    await apiChat(router)
    await apiDashboard(router)
    await apiGroups(router)
    await apiI18n(router)
    await apiProfile(router)
    await apiRecordings(router)
    await apiUsers(router)

    const publicPath = path.join(runtime.service_dir, 'public')

    // Create unified final handler with Pyrite-specific MIME types
    const finalHandleRequest = createFinalHandler({
        customWebSocketHandlers: [{
            handler: proxySFUWebSocket,
            path: '/sfu',
        }],
        devContext,
        endpointAllowList: ['/api/context', '/api/i18n', '/api/login', '/api/chat/emoji', '/api/groups/public'],
        getUserByUsername,
        logger,
        mimeTypes: {
            '.css': 'text/css',
            '.eot': 'application/vnd.ms-fontobject',
            '.gif': 'image/gif',
            '.jpeg': 'image/jpeg',
            '.jpg': 'image/jpeg',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
            '.ttf': 'font/ttf',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
        },
        packageName: 'pyrite',
        publicPath,
        router,
        sessionCookieName: 'pyrite-session',
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
