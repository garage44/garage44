import {createFinalHandler} from '@garage44/common/lib/middleware'
import {createComplexAuthContext} from '@garage44/common/lib/profile.ts'
import {devContext} from '@garage44/common/lib/dev-context'
import {userManager} from '@garage44/common/service'
import {logger, runtime} from '../service.ts'
import apiChat from '../api/chat.ts'
import apiChannels from '../api/channels.ts'
import apiDashboard from '../api/dashboard.ts'
import apiGroups from '../api/groups.ts'
import apiI18n from '../api/i18n.ts'
import apiRecordings from '../api/recordings.ts'
import apiUsers from '../api/users.ts'
import {config} from '../lib/config.ts'
import {loadGroups} from './group.js'
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


// Auth middleware that can be reused across routes
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

    // Register HTTP API endpoints using familiar Express-like pattern
    await apiChat(router)
    await apiChannels(router)
    await apiDashboard(router)
    await apiGroups(router)
    await apiI18n(router)
    await apiRecordings(router)
    await apiUsers(router)

    const publicPath = path.join(runtime.service_dir, 'public')

    // Create complex auth context for Pyrite (needs groups and users data)
    const contextFunctions = await createComplexAuthContext({
        loadGroups,
        loadUsers: () => userManager.listUsers(),
    })

    // Create unified final handler with built-in authentication API
    const finalHandleRequest = createFinalHandler({
        configPath: '~/.pyriterc',
        contextFunctions: {
            adminContext: contextFunctions.adminContext,
            deniedContext: contextFunctions.deniedContext,
            userContext: contextFunctions.userContext,
        },
        customWebSocketHandlers: [{
            handler: proxySFUWebSocket,
            path: '/sfu',
        }],
        devContext,
        endpointAllowList: ['/api/i18n', '/api/chat/emoji', '/api/groups/public', '/api/login'],
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
