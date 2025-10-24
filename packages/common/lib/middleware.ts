import {UserManager} from './user-manager'
import path from 'node:path'

// Configuration interface for package-specific middleware behavior
export interface MiddlewareConfig {
    configPath: string
    customWebSocketHandlers?: Array<{
        handler: (request: Request, server: unknown) => Promise<Response | undefined>
        path: string
    }>
    endpointAllowList: string[]
    packageName: string
    sessionCookieName: string
}

// Create a simple session store for Bun.serve
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
const sessionMiddleware = (request: Request, sessionCookieName: string) => {
    const cookies = parseCookies(request)
    const sessionId = cookies[sessionCookieName]

    if (!sessionId || !sessions.has(sessionId)) {
        const newSessionId = crypto.randomUUID()
        const session = {userid: null}
        sessions.set(newSessionId, session)
        return {session, sessionId: newSessionId}
    }

    return {session: sessions.get(sessionId), sessionId}
}

// Auth middleware for Bun.serve
const authMiddleware = async (request: Request, session: unknown, userManager: UserManager) => {
    const url = new URL(request.url)

    if (!url.pathname.startsWith('/api')) {
        return true
    }

    // Allow authentication endpoints to pass through to handlers
    if (url.pathname === '/api/context' || url.pathname === '/api/login' || url.pathname === '/api/logout') {
        return true
    }

    // Check if user is authenticated
    if ((session as {userid?: string}).userid) {
        const user = await userManager.getUserByUsername((session as {userid: string}).userid)
        if (user) {
            return true
        }
    }

    if (process.env.GARAGE44_NO_SECURITY) {
        // Find the first admin user and set their userid in the session
        const users = await userManager.listUsers()
        const adminUser = users.find((user) => user.permissions?.admin)
        if (adminUser) {
            (session as {userid: string}).userid = adminUser.username
        }
        return true
    }

    return false
}

// Helper to set session cookie in response
const setSessionCookie = (response: Response, sessionId: string, sessionCookieName: string) => {
    const headers = new Headers(response.headers)
    headers.set('Set-Cookie', `${sessionCookieName}=${sessionId}; Path=/; HttpOnly; SameSite=Strict`)
    return new Response(response.body, {
        headers,
        status: response.status,
        statusText: response.statusText,
    })
}

// WebSocket handler for Bun.serve
const handleWebSocket = (_ws: unknown, _request: Request) => {
    // Handle WebSocket connections
    // This will be enhanced by the WebSocket server implementation
}


// Create unified middleware with package-specific configuration
export const createMiddleware = (config: MiddlewareConfig, userManager: UserManager) => {
    return {
        handleRequest: async (request: Request, server?: unknown, _logger?: unknown, _bunchyConfig?: unknown): Promise<Response | undefined> => {
            const url = new URL(request.url)

            // Handle custom WebSocket handlers first
            if (config.customWebSocketHandlers) {
                for (const handler of config.customWebSocketHandlers) {
                    if (url.pathname.startsWith(handler.path)) {
                        return await handler.handler(request, server)
                    }
                }
            }

            // Handle WebSocket upgrade requests
            if (url.pathname === '/ws' || url.pathname === '/bunchy') {
                if (server && typeof (server as {upgrade?: unknown}).upgrade === 'function') {
                    const success = (server as {upgrade: (req: Request, data: unknown) => boolean}).upgrade(request, {data: {endpoint: url.pathname}})
                    if (success) {
                        return
                    }
                    return new Response('WebSocket upgrade failed', {status: 400})
                }
                return new Response('WebSocket server not available', {status: 500})
            }

            // Handle session and auth
            const {session} = sessionMiddleware(request, config.sessionCookieName)

            if (!(await authMiddleware(request, session, userManager))) {
                return new Response('Unauthorized', {status: 401})
            }

            // Return null to indicate no handler matched - let the package handle routing
            return null
        },
        handleWebSocket,
        sessionMiddleware: (request: Request) => sessionMiddleware(request, config.sessionCookieName),
        setSessionCookie: (response: Response, sessionId: string) => setSessionCookie(response, sessionId, config.sessionCookieName),
        userManager,
    }
}


// Create unified final request handler with common patterns
export const createFinalHandler = (config: {
    configPath: string
    contextFunctions: {
        adminContext: () => unknown
        deniedContext: () => unknown
        userContext: () => unknown
    }
    customWebSocketHandlers?: Array<{
        handler: (request: Request, server: unknown) => Promise<Response | undefined>
        path: string
    }>
    devContext: {
        addHttp: (data: unknown) => void
    }
    endpointAllowList: string[]
    logger: {
        debug: (msg: string) => void
        info: (msg: string) => void
    }
    mimeTypes?: Record<string, string>
    packageName: string
    publicPath: string
    router: {
        route: (request: Request, session: unknown) => Promise<Response | null>
    }
    sessionCookieName: string
    userManager: UserManager
}) => {

    const unifiedMiddleware = createMiddleware({
        configPath: config.configPath,
        customWebSocketHandlers: config.customWebSocketHandlers,
        endpointAllowList: config.endpointAllowList,
        packageName: config.packageName,
        sessionCookieName: config.sessionCookieName,
    }, config.userManager)

    return async (request: Request, server?: unknown): Promise<Response | undefined> => {
        const url = new URL(request.url)

        config.logger.info(`[HTTP] ${url.pathname} miss`)
        config.devContext.addHttp({method: request.method, ts: Date.now(), url: url.pathname})

        // Use unified middleware for session/auth and custom handlers
        const unifiedResponse = await unifiedMiddleware.handleRequest(request, server, config.logger, null)
        if (unifiedResponse) {
            return unifiedResponse
        }

        // Get session for API routing
        const {session, sessionId} = unifiedMiddleware.sessionMiddleware(request)

        // Handle /api/context - requires authentication to check session state
        if (url.pathname === '/api/context') {
            let context = null

            if (process.env.GARAGE44_NO_SECURITY) {
                context = await Promise.resolve(config.contextFunctions.adminContext())
                return new Response(JSON.stringify(context), {
                    headers: {'Content-Type': 'application/json'},
                })
            }

            // Check session for user context
            if ((session as {userid?: string})?.userid) {
                const user = await config.userManager.getUserByUsername((session as {userid: string}).userid)
                if (user) {
                    if (user.permissions?.admin) {
                        context = await Promise.resolve(config.contextFunctions.adminContext())
                    } else {
                        context = await Promise.resolve(config.contextFunctions.userContext())
                    }
                } else {
                    context = config.contextFunctions.deniedContext()
                }
            } else {
                context = config.contextFunctions.deniedContext()
            }

            return new Response(JSON.stringify(context), {
                headers: {'Content-Type': 'application/json'},
            })
        }

        if (url.pathname === '/api/login' && request.method === 'POST') {
            const body = await request.json()
            const username = body.username
            const password = body.password

            let context = await Promise.resolve(config.contextFunctions.deniedContext())
            const user = await config.userManager.authenticate(username, password)

            if (user) {                // Set the user in session
                ;(session as {userid: string}).userid = user.username

                if (user.permissions?.admin) {
                    context = await Promise.resolve(config.contextFunctions.adminContext())
                } else {
                    console.log(`[AUTH] User ${username} is regular user, granting user context`)
                    context = await Promise.resolve(config.contextFunctions.userContext())
                }
            } else {
                console.log(`[AUTH] Authentication failed for user: ${username}`)
            }

            return new Response(JSON.stringify(context), {
                headers: {'Content-Type': 'application/json'},
            })
        }

        if (url.pathname === '/api/logout' && request.method === 'GET') {
            // Clear the session
            if (session) {
                (session as {userid: string | null}).userid = null
            }

            const context = config.contextFunctions.deniedContext()
            return new Response(JSON.stringify(context), {
                headers: {'Content-Type': 'application/json'},
            })
        }

        // Serve static files from public directory
        if (url.pathname.startsWith('/public/')) {
            const filePath = path.join(config.publicPath, url.pathname.replace('/public', ''))
            try {
                const file = Bun.file(filePath)
                if (await file.exists()) {
                    config.logger.debug(`[HTTP] GET ${filePath}`)
                    config.devContext.addHttp({method: 'GET', status: 200, ts: Date.now(), url: filePath})

                    // Use custom MIME types if provided (Pyrite), otherwise default
                    if (config.mimeTypes) {
                        const ext = path.extname(filePath).toLowerCase()
                        const contentType = config.mimeTypes[ext] || 'application/octet-stream'
                        return new Response(file, {
                            headers: {'Content-Type': contentType},
                        })
                    }

                    return new Response(file)
                }
            } catch (error) {
                // File doesn't exist, continue to next handler
                config.logger.debug(`[HTTP] static file not found: ${filePath} (${error})`)
            }
        }

        // Try the router for HTTP API endpoints
        const apiResponse = await config.router.route(request, session)
        if (apiResponse) {
            config.logger.info(`[HTTP] API route matched ${url.pathname}`)
            config.devContext.addHttp({method: request.method, status: apiResponse.status, ts: Date.now(), url: url.pathname})
            // Set session cookie if this is a new session
            return unifiedMiddleware.setSessionCookie(apiResponse, sessionId)
        }

        // SPA fallback - serve index.html for all other routes
        try {
            const indexFile = Bun.file(path.join(config.publicPath, 'index.html'))
            if (await indexFile.exists()) {
                config.logger.info(`[HTTP] SPA fallback for ${url.pathname}`)
                const response = new Response(indexFile, {
                    headers: {'Content-Type': 'text/html'},
                })
                config.devContext.addHttp({method: request.method, status: 200, ts: Date.now(), url: url.pathname})
                return unifiedMiddleware.setSessionCookie(response, sessionId)
            }
        } catch (error) {
            // index.html doesn't exist
            config.logger.debug(`[HTTP] SPA fallback index.html not found: ${error}`)
        }

        // Final fallback - 404
        config.logger.info(`[HTTP] 404 for ${url.pathname}`)
        const response = new Response('Not Found', {status: 404})
        config.devContext.addHttp({method: request.method, status: 404, ts: Date.now(), url: url.pathname})
        return unifiedMiddleware.setSessionCookie(response, sessionId)
    }
}

export {
    handleWebSocket,
}