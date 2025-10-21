import {handleRequest, handleWebSocket} from '@garage44/common/lib/middleware'
import {devContext} from '@garage44/common/lib/dev-context'
import {logger, runtime} from '../service.ts'
import apiConfig from '../api/config.ts'
import apiI18n from '../api/i18n.ts'
import apiProfile from '../api/profile.ts'
import apiWorkspaces from '../api/workspaces'
import {config} from '../lib/config.ts'
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

// Session store for Bun.serve
const sessions = new Map()

// Parse cookies from request
const parseCookies = (request: Request) => {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) {
        return {}
    }

    const cookies: Record<string, string> = {}
    cookieHeader.split(';').forEach((cookie) => {
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
    const sessionId = cookies['expressio-session']

    if (!sessionId || !sessions.has(sessionId)) {
        const newSessionId = crypto.randomUUID()
        const session = {userid: null}
        sessions.set(newSessionId, session)
        return {session, sessionId: newSessionId}
    }

    return {session: sessions.get(sessionId), sessionId}
}

// Auth middleware for Bun.serve
const authMiddleware = async (request: Request, session: any) => {
    const url = new URL(request.url)

    if (!url.pathname.startsWith('/api')) {
        return true
    }

    const endpointAllowList = [
        '/api/context',
        '/api/translations',
        '/api/login',
    ]

    if (endpointAllowList.some((endpoint) => url.pathname.includes(endpoint))) {
        return true
    }

    if (session.userid) {
        const {getUserByUsername} = await import('./user.ts')
        const user = await getUserByUsername(session.userid)
        if (user) {
            return true
        }
    }

    if (process.env.GARAGE44_NO_SECURITY) {
        // Find the first admin user and set their userid in the session
        const {loadUsers} = await import('./user.ts')
        const users = await loadUsers()
        const adminUser = users.find((user) => user.permissions.admin)
        if (adminUser) {
            session.userid = adminUser.username
        }
        return true
    }

    return false
}


// Helper to set session cookie in response
const setSessionCookie = (response: Response, sessionId: string) => {
    const headers = new Headers(response.headers)
    headers.set('Set-Cookie', `expressio-session=${sessionId}; Path=/; HttpOnly; SameSite=Strict`)
    return new Response(response.body, {
        headers,
        status: response.status,
        statusText: response.statusText,
    })
}

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


async function initMiddleware(bunchyConfig) {
    const router = new Router()

    // Register HTTP API endpoints using familiar Express-like pattern
    await apiI18n(router)
    await apiConfig(router)
    await apiProfile(router)
    await apiWorkspaces(router)

    const publicPath = path.join(runtime.service_dir, 'public')

    // Add static file serving and SPA fallback to the request handler
    const finalHandleRequest = async (request: Request, server?: any): Promise<Response | undefined> => {
        const url = new URL(request.url)

        // Handle WebSocket upgrade requests
        if (url.pathname === '/ws' || url.pathname === '/bunchy') {
            logger.info(`[HTTP] ${url.pathname} hit, attempting Bun WebSocket upgrade`)
            devContext.addHttp({method: 'WS_UPGRADE', ts: Date.now(), url: url.pathname})
            if (server && typeof server.upgrade === 'function') {
                const success = server.upgrade(request, {data: {endpoint: url.pathname}})
                if (success) {
                    return
                }
                return new Response('WebSocket upgrade failed', {status: 400})
            }
            return new Response('WebSocket server not available', {status: 500})
        }

        logger.info(`[HTTP] ${url.pathname} miss`)
        devContext.addHttp({method: request.method, ts: Date.now(), url: url.pathname})

        // Handle session and auth
        const {session, sessionId} = sessionMiddleware(request)

        if (!(await authMiddleware(request, session))) {
            return new Response('Unauthorized', {status: 401})
        }

        // Serve static files from public directory
        if (url.pathname.startsWith('/public/')) {
            const filePath = path.join(publicPath, url.pathname.replace('/public', ''))
            try {
                const file = Bun.file(filePath)
                if (await file.exists()) {
                    logger.debug(`[HTTP] GET ${filePath}`)
                    devContext.addHttp({method: 'GET', status: 200, ts: Date.now(), url: filePath})
                    return new Response(file)
                }
            } catch (error) {
                // File doesn't exist, continue to next handler
                logger.debug(`[HTTP] static file not found: ${filePath} (${error})`)
            }
        }

        // Try the router for HTTP API endpoints
        const apiResponse = await router.route(request, session)
        if (apiResponse) {
            logger.info('[HTTP] API route matched', url.pathname)
            devContext.addHttp({method: request.method, status: apiResponse.status, ts: Date.now(), url: url.pathname})
            // Set session cookie if this is a new session
            return setSessionCookie(apiResponse, sessionId)
        }

        // Try the enhanced request handler (for WebSocket API, etc.)
        try {
            const response = await handleRequest(request, config,logger, bunchyConfig)
            if (response) {
                logger.info('[HTTP] Enhanced handler matched', url.pathname)
                devContext.addHttp({method: request.method, status: response.status, ts: Date.now(), url: url.pathname})
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
                    headers: {'Content-Type': 'text/html'},
                })
                devContext.addHttp({method: request.method, status: 200, ts: Date.now(), url: url.pathname})
                return setSessionCookie(response, sessionId)
            }
        } catch (error) {
            // index.html doesn't exist
            logger.debug(`[HTTP] SPA fallback index.html not found: ${error}`)
        }

        // Final fallback - 404
        logger.info('[HTTP] 404 for', url.pathname)
        const response = new Response('Not Found', {status: 404})
        devContext.addHttp({method: request.method, status: 404, ts: Date.now(), url: url.pathname})
        return setSessionCookie(response, sessionId)
    }

    return {
        handleRequest: finalHandleRequest,
        handleWebSocket,
    }
}

export {
    initMiddleware,
    requireAdmin,
}