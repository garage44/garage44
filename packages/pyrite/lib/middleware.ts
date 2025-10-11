import {handleRequest, handleWebSocket} from '@garage44/common/lib/middleware'
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
import path from 'node:path'

// Simple HTTP router for Bun.serve that mimics Express pattern
class Router {
    routes: { method: string, path: RegExp, handler: (req: Request, params: Record<string, string>, session?: any) => Promise<Response> }[] = [];

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
        });
    }

    async route(req: Request, session?: any): Promise<Response | null> {
        const url = new URL(req.url);
        const pathname = url.pathname;
        for (const { method, path, handler } of this.routes) {
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

// Session store for Bun.serve
const sessions = new Map()

// Parse cookies from request
const parseCookies = (request: Request) => {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
        return {}
    }

    const cookies: Record<string, string> = {}
    cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=')
        if (name && value) {
            cookies[name] = decodeURIComponent(value)
        }
    })
    return cookies
}

// Session middleware for Bun.serve
const sessionMiddleware = (request: Request) => {
    const cookies = parseCookies(request)
    const sessionId = cookies['pyrite-session']

    if (!sessionId || !sessions.has(sessionId)) {
        const newSessionId = crypto.randomUUID()
        const session = { userid: null }
        sessions.set(newSessionId, session)
        return { session, sessionId: newSessionId }
    }

    return { session: sessions.get(sessionId), sessionId }
}

// Auth middleware for Bun.serve
const authMiddleware = (request: Request, session: any) => {
    const url = new URL(request.url)

    if (!url.pathname.startsWith('/api')) {
        return true
    }

    const endpointAllowList = [
        '/api/context',
        '/api/i18n',
        '/api/login',
        '/api/chat/emoji',
        '/api/groups/public',
    ]

    if (endpointAllowList.some((endpoint) => url.pathname.includes(endpoint))) {
        return true
    }

    if (session.userid) {
        const users = config.users
        const user = users.find((user) => user.name === session.userid)
        if (user) {
            return true
        }
    }

    if (process.env.PYRITE_NO_SECURITY) {
        // Find the first admin user and set their userid in the session
        const adminUser = config.users.find(user => user.admin)
        if (adminUser) {
            session.userid = adminUser.name
        }
        return true
    }

    return false
}

// Helper to set session cookie in response
const setSessionCookie = (response: Response, sessionId: string) => {
    const headers = new Headers(response.headers)
    headers.set('Set-Cookie', `pyrite-session=${sessionId}; Path=/; HttpOnly; SameSite=Strict`)
    return new Response(response.body, {
        headers,
        status: response.status,
        statusText: response.statusText,
    })
}

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
            return undefined
        }

        return new Response('WebSocket upgrade failed', {status: 400})
    } catch (error) {
        logger.error(`[SFU Proxy] Failed to connect to SFU: ${error}`)
        return new Response('Failed to connect to SFU', {status: 502})
    }
}

async function initMiddleware(bunchyConfig) {
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

    // Add static file serving and SPA fallback to the request handler
    const finalHandleRequest = async (request: Request, server?: any): Promise<Response | undefined> => {
        const url = new URL(request.url)

        // Handle WebSocket upgrade requests
        if (url.pathname === '/ws' || url.pathname === '/bunchy') {
            logger.info(`[HTTP] ${url.pathname} hit, attempting Bun WebSocket upgrade`)
            devContext.addHttp({ ts: Date.now(), method: 'WS_UPGRADE', url: url.pathname })
            if (server && typeof server.upgrade === 'function') {
                const success = server.upgrade(request, { data: { endpoint: url.pathname } })
                if (success) {
                    return
                }
                return new Response('WebSocket upgrade failed', {status: 400})
            }
            return new Response('WebSocket server not available', {status: 500})
        }

        // Handle SFU WebSocket proxy
        if (url.pathname.startsWith('/sfu')) {
            logger.info(`[HTTP] SFU WebSocket proxy request: ${url.pathname}`)
            return await proxySFUWebSocket(request, server)
        }

        logger.info(`[HTTP] ${url.pathname} miss`)
        devContext.addHttp({ ts: Date.now(), method: request.method, url: url.pathname })

        // Handle session and auth
        const { session, sessionId } = sessionMiddleware(request)

        if (!authMiddleware(request, session)) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Serve static files from public directory
        if (url.pathname.startsWith('/public/')) {
            const filePath = path.join(publicPath, url.pathname.replace('/public', ''))
            try {
                const file = Bun.file(filePath)
                if (await file.exists()) {
                    logger.debug(`[HTTP] GET ${filePath}`)
                    devContext.addHttp({ ts: Date.now(), method: 'GET', url: filePath, status: 200 })

                    // Determine MIME type based on file extension
                    const ext = path.extname(filePath).toLowerCase()
                    const mimeTypes: Record<string, string> = {
                        '.css': 'text/css',
                        '.js': 'application/javascript',
                        '.json': 'application/json',
                        '.png': 'image/png',
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.gif': 'image/gif',
                        '.svg': 'image/svg+xml',
                        '.woff': 'font/woff',
                        '.woff2': 'font/woff2',
                        '.ttf': 'font/ttf',
                        '.eot': 'application/vnd.ms-fontobject',
                    }
                    const contentType = mimeTypes[ext] || 'application/octet-stream'

                    return new Response(file, {
                        headers: { 'Content-Type': contentType }
                    })
                }
            } catch (error) {
                // File doesn't exist, continue to next handler
                logger.debug(`[HTTP] static file not found: ${filePath} (${error})`)
            }
        }

        // Try the router for HTTP API endpoints
        const apiResponse = await router.route(request, session);
        if (apiResponse) {
            logger.info('[HTTP] API route matched', url.pathname)
            devContext.addHttp({ ts: Date.now(), method: request.method, url: url.pathname, status: apiResponse.status })
            // Set session cookie if this is a new session
            return setSessionCookie(apiResponse, sessionId);
        }

        // Try the enhanced request handler (for WebSocket API, etc.)
        try {
            const response = await handleRequest(request, config, logger, bunchyConfig)
            if (response) {
                logger.info('[HTTP] Enhanced handler matched', url.pathname)
                devContext.addHttp({ ts: Date.now(), method: request.method, url: url.pathname, status: response.status })
                return setSessionCookie(response, sessionId)
            }
        } catch (error) {
            // Handler didn't match or failed, continue to SPA fallback
            logger.debug(`[HTTP] Enhanced handler error: ${error}`)
        }

        // SPA fallback - serve index.html for all other routes
        try {
            const indexFile = Bun.file(path.join(publicPath, 'index.html'))
            if (await indexFile.exists()) {
                logger.info('[HTTP] SPA fallback for', url.pathname)
                const response = new Response(indexFile, {
                    headers: { 'Content-Type': 'text/html' }
                })
                devContext.addHttp({ ts: Date.now(), method: request.method, url: url.pathname, status: 200 })
                return setSessionCookie(response, sessionId);
            }
        } catch (error) {
            // index.html doesn't exist
            logger.debug(`[HTTP] SPA fallback index.html not found: ${error}`)
        }

        // Final fallback - 404
        logger.info('[HTTP] 404 for', url.pathname)
        const response = new Response('Not Found', { status: 404 })
        devContext.addHttp({ ts: Date.now(), method: request.method, url: url.pathname, status: 404 })
        return setSessionCookie(response, sessionId);
    }

    return {
        handleRequest: finalHandleRequest,
        handleWebSocket
    }
}

export {
    initMiddleware,
    requireAdmin,
}
