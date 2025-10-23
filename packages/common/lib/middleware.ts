import path from 'node:path'

// Configuration interface for package-specific middleware behavior
export interface MiddlewareConfig {
    customWebSocketHandlers?: Array<{
        handler: (request: Request, server: unknown) => Promise<Response | undefined>
        path: string
    }>
    endpointAllowList: string[]
    getUserByUsername: (username: string) => Promise<unknown>
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
const authMiddleware = async (request: Request, session: unknown, config: MiddlewareConfig) => {
    const url = new URL(request.url)

    if (!url.pathname.startsWith('/api')) {
        return true
    }

    if (config.endpointAllowList.some((endpoint) => url.pathname.includes(endpoint))) {
        return true
    }

    if ((session as {userid?: string}).userid) {
        const user = await config.getUserByUsername((session as {userid: string}).userid)
        if (user) {
            return true
        }
    }

    if (process.env.GARAGE44_NO_SECURITY) {
        // Find the first admin user and set their userid in the session
        const users = await config.getUserByUsername('*') // Get all users
        const adminUser = (users as unknown[])?.find((user: unknown) => (user as {permissions?: {admin?: boolean}}).permissions?.admin)
        if (adminUser) {
            (session as {userid: string}).userid = (adminUser as {username: string}).username
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

// Request handler for Bun.serve
const handleRequest = async (request: Request, config: unknown, logger: unknown, bunchyConfig: unknown): Promise<Response | null> => {
    const url = new URL(request.url)

    // Log request
    ;(logger as {info: (msg: string) => void}).info(`${request.method} ${url.pathname}`)

    // Handle session and auth
    const {session} = sessionMiddleware(request, 'expressio-session') // Default for backward compatibility

    if (!(await authMiddleware(request, session, {
        customWebSocketHandlers: undefined,
        endpointAllowList: ['/api/context', '/api/translations', '/api/login'],
        getUserByUsername: async (username: string) => {
            // Fallback for common package - use config.users
            const users = (config as {users: unknown[]}).users
            return users.find((user: unknown) => (user as {name: string}).name === username)
        },
        packageName: 'common',
        sessionCookieName: 'expressio-session',
    }))) {
        return new Response('Unauthorized', {status: 401})
    }

    // Handle development static files
    if (process.env.BUN_ENV === 'development') {
        if (url.pathname.startsWith('/common/')) {
            const filePath = path.join((bunchyConfig as {common: string}).common, url.pathname.replace('/common', ''))
            try {
                const file = Bun.file(filePath)
                if (await file.exists()) {
                    return new Response(file)
                }
            } catch (error) {
                ;(logger as {debug: (msg: string) => void}).debug(`[HTTP] static file not found: ${filePath} (${error})`)
                // File doesn't exist, continue
            }
        }

        if (url.pathname.startsWith('/src/')) {
            const filePath = path.join((bunchyConfig as {workspace: string}).workspace, 'src', url.pathname.replace('/src', ''))
            try {
                const file = Bun.file(filePath)
                if (await file.exists()) {
                    return new Response(file)
                }
            } catch {
                // File doesn't exist, continue
            }
        }
    }

    // Return null to indicate no handler matched
    return null
}

// Create unified middleware with package-specific configuration
export const createMiddleware = (config: MiddlewareConfig) => {
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

            if (!(await authMiddleware(request, session, config))) {
                return new Response('Unauthorized', {status: 401})
            }

            // Return null to indicate no handler matched - let the package handle routing
            return null
        },
        handleWebSocket,
        sessionMiddleware: (request: Request) => sessionMiddleware(request, config.sessionCookieName),
        setSessionCookie: (response: Response, sessionId: string) => setSessionCookie(response, sessionId, config.sessionCookieName),
    }
}

// Create unified final request handler with common patterns
export const createFinalHandler = (config: {
    customWebSocketHandlers?: Array<{
        handler: (request: Request, server: unknown) => Promise<Response | undefined>
        path: string
    }>
    devContext: {
        addHttp: (data: unknown) => void
    }
    endpointAllowList: string[]
    getUserByUsername: (username: string) => Promise<unknown>
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
}) => {
    const unifiedMiddleware = createMiddleware(config)

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
    handleRequest,
    handleWebSocket,
}