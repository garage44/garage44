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
// This is a pass-through proxy that doesn't require WebSocket server management
async function proxySFUWebSocket(request: Request, server: any) {
    const sfuUrl = config.sfu.url.replace('http://', 'ws://').replace('https://', 'wss://')
    const url = new URL(request.url)

    // Galene expects WebSocket connections at /ws, not /sfu
    // Map client's /sfu path to Galene's /ws endpoint
    const targetUrl = `${sfuUrl}/ws${url.search}`

    logger.info(`[SFU Proxy] Connecting to upstream: ${targetUrl}`)
    logger.debug(`[SFU Proxy] Client requested: ${request.url}`)
    logger.debug(`[SFU Proxy] SFU base URL: ${config.sfu.url}`)

    try {
        // Create WebSocket connection to upstream server (Galène)
        const upstream = new WebSocket(targetUrl)

        // Wait for upstream connection to open before upgrading client
        // This ensures we can catch connection errors early
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                logger.error(`[SFU Proxy] Connection timeout after 5s for ${targetUrl}`)
                reject(new Error(`Connection timeout after 5s for ${targetUrl}`))
            }, 5000)

            upstream.onopen = () => {
                clearTimeout(timeout)
                logger.info(`[SFU Proxy] Successfully connected to upstream: ${targetUrl}`)
                resolve()
            }

            upstream.onerror = (error: Event) => {
                clearTimeout(timeout)
                logger.error(`[SFU Proxy] Upstream WebSocket error for ${targetUrl}:`, error)
                if ('message' in error) {
                    logger.error(`[SFU Proxy] Error message: ${(error as any).message}`)
                }
                logger.error(`[SFU Proxy] Upstream connection state: ${upstream.readyState}`)

                // Try to get more error details
                if (upstream.readyState === WebSocket.CLOSED || upstream.readyState === WebSocket.CLOSING) {
                    logger.error(`[SFU Proxy] Connection closed immediately, check if Galene is running on ${targetUrl}`)
                }

                reject(new Error(`Failed to connect to ${targetUrl}. Check if Galene is running and accessible.`))
            }

            upstream.onclose = (event: CloseEvent) => {
                clearTimeout(timeout)
                logger.warn(`[SFU Proxy] Upstream connection closed before upgrade: ${event.code} ${event.reason || 'no reason'}`)
                if (event.code !== 1000) {
                    logger.error(`[SFU Proxy] Abnormal close: code=${event.code}, reason=${event.reason || 'none'}`)
                }
                // Only reject if not already resolved
                if (upstream.readyState !== WebSocket.OPEN) {
                    reject(new Error(`Connection closed: ${event.code} ${event.reason || 'no reason'}`))
                }
            }
        })

        // Upgrade client connection with special marker to skip manager lookup
        const upgraded = server.upgrade(request, {
            data: {
                endpoint: '/sfu',
                proxy: true, // Mark as proxy to skip manager lookup
                upstream, // Store upstream connection for generic forwarding
            },
        })

        if (upgraded) {
            logger.info(`[SFU Proxy] Client connection upgraded successfully`)
            // Bidirectional message forwarding will be handled by common WebSocket handler
            return
        }

        logger.error(`[SFU Proxy] Failed to upgrade client connection`)
        upstream.close()
        return new Response('WebSocket upgrade failed', {status: 400})
    } catch (error) {
        logger.error(`[SFU Proxy] Failed to connect to SFU: ${error}`)
        if (error instanceof Error) {
            logger.error(`[SFU Proxy] Error details: ${error.message}`)
            logger.error(`[SFU Proxy] Stack: ${error.stack}`)
        }
        return new Response(`Failed to connect to SFU: ${error instanceof Error ? error.message : String(error)}`, {status: 502})
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
