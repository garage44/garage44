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
    if (url.pathname === '/api/context' || url.pathname === '/api/login' || url.pathname === '/api/logout' || url.pathname === '/api/users/me') {
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
                    // Get session before upgrade so it's available in WebSocket handlers
                    const {session} = sessionMiddleware(request, config.sessionCookieName)

                    // Populate session with admin user if GARAGE44_NO_SECURITY is enabled
                    if (process.env.GARAGE44_NO_SECURITY && !(session as {userid?: string}).userid) {
                        const users = await userManager.listUsers()
                        const adminUser = users.find((user) => user.permissions?.admin)
                        if (adminUser) {
                            (session as {userid: string}).userid = adminUser.username
                        }
                    }

                    const success = (server as {upgrade: (req: Request, data: unknown) => boolean}).upgrade(request, {
                        data: {
                            endpoint: url.pathname,
                            session,
                        },
                    })
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

        // Get session early and populate it if needed (before unified middleware)
        let {session, sessionId} = unifiedMiddleware.sessionMiddleware(request)

        // Populate session with admin user if GARAGE44_NO_SECURITY is enabled
        if (process.env.GARAGE44_NO_SECURITY && !(session as {userid?: string}).userid) {
            const users = await config.userManager.listUsers()
            const adminUser = users.find((user) => user.permissions?.admin)
            if (adminUser) {
                (session as {userid: string}).userid = adminUser.username
                // Session is stored in Map, modifying it in place persists automatically
                // But ensure it's set back in case of reference issues
                sessions.set(sessionId, session)
                config.logger.debug(`[Middleware] Populated session ${sessionId} with userid: ${adminUser.username}`)
            }
        }

        // Use unified middleware for session/auth and custom handlers
        // Pass the populated session to unified middleware by ensuring it uses the same session
        const unifiedResponse = await unifiedMiddleware.handleRequest(request, server, config.logger, null)
        if (unifiedResponse) {
            return unifiedResponse
        }

        // Re-get session after unified middleware to ensure we have the latest version
        const {session: finalSession, sessionId: finalSessionId} = unifiedMiddleware.sessionMiddleware(request)

        // Populate session with admin user if GARAGE44_NO_SECURITY is enabled (again, in case unified middleware created a new session)
        if (process.env.GARAGE44_NO_SECURITY && !(finalSession as {userid?: string}).userid) {
            const users = await config.userManager.listUsers()
            const adminUser = users.find((user) => user.permissions?.admin)
            if (adminUser) {
                (finalSession as {userid: string}).userid = adminUser.username
                sessions.set(finalSessionId, finalSession)
                config.logger.debug(`[Middleware] Re-populated session ${finalSessionId} with userid: ${adminUser.username}`)
            }
        }

        // Handle /api/context - requires authentication to check session state
        if (url.pathname === '/api/context') {
            let context = null

            if (process.env.GARAGE44_NO_SECURITY) {
                const baseContext = await Promise.resolve(config.contextFunctions.adminContext())
                // Get user profile for admin
                const users = await config.userManager.listUsers()
                const adminUser = users.find((user) => user.permissions?.admin)
                if (adminUser) {
                    context = {
                        ...baseContext,
                        id: adminUser.id,
                        username: adminUser.username,
                        password: adminUser.password.key, // Include password for SFU auth (will encrypt later)
                        profile: {
                            avatar: adminUser.profile.avatar || 'placeholder-1.png',
                            displayName: adminUser.profile.displayName || adminUser.username,
                        },
                    }
                } else {
                    context = baseContext
                }
                return new Response(JSON.stringify(context), {
                    headers: {'Content-Type': 'application/json'},
                })
            }

            // Check session for user context
            if ((finalSession as {userid?: string})?.userid) {
                const user = await config.userManager.getUserByUsername((finalSession as {userid: string}).userid)
                if (user) {
                    const baseContext = user.permissions?.admin
                        ? await Promise.resolve(config.contextFunctions.adminContext())
                        : await Promise.resolve(config.contextFunctions.userContext())

                    // Include full user profile in context
                    context = {
                        ...baseContext,
                        id: user.id,
                        username: user.username,
                        password: user.password.key, // Include password for SFU auth (will encrypt later)
                        profile: {
                            avatar: user.profile.avatar || 'placeholder-1.png',
                            displayName: user.profile.displayName || user.username,
                        },
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

        // Handle /api/users/me - get current user profile
        if (url.pathname === '/api/users/me' && request.method === 'GET') {
            const username = (finalSession as {userid?: string}).userid

            if (!username) {
                return new Response(JSON.stringify({error: 'not authenticated'}), {
                    headers: {'Content-Type': 'application/json'},
                    status: 401,
                })
            }

            const user = await config.userManager.getUserByUsername(username)
            if (!user) {
                return new Response(JSON.stringify({error: 'user not found'}), {
                    headers: {'Content-Type': 'application/json'},
                    status: 404,
                })
            }

            // Return user data in the format expected by the frontend
            return new Response(JSON.stringify({
                id: user.id,
                username: user.username,
                profile: {
                    avatar: user.profile.avatar || 'placeholder-1.png',
                    displayName: user.profile.displayName || user.username,
                },
            }), {
                headers: {'Content-Type': 'application/json'},
            })
        }

        if (url.pathname === '/api/login' && request.method === 'POST') {
            const body = await request.json()
            const username = body.username
            const password = body.password

            let context = await Promise.resolve(config.contextFunctions.deniedContext())
            const user = await config.userManager.authenticate(username, password)

            if (user) {
                // Set the user in session
                ;(session as {userid: string}).userid = user.username

                const baseContext = user.permissions?.admin
                    ? await Promise.resolve(config.contextFunctions.adminContext())
                    : await Promise.resolve(config.contextFunctions.userContext())

                // Include full user profile in context
                context = {
                    ...baseContext,
                    id: user.id,
                    username: user.username,
                    password: user.password.key, // Include password for SFU auth (will encrypt later)
                    profile: {
                        avatar: user.profile.avatar || 'placeholder-1.png',
                        displayName: user.profile.displayName || user.username,
                    },
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
        const apiResponse = await config.router.route(request, finalSession as Record<string, string>)
        if (apiResponse) {
            config.logger.info(`[HTTP] API route matched ${url.pathname}`)
            config.devContext.addHttp({method: request.method, status: apiResponse.status, ts: Date.now(), url: url.pathname})
            // Set session cookie if this is a new session
            return unifiedMiddleware.setSessionCookie(apiResponse, finalSessionId)
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
        return unifiedMiddleware.setSessionCookie(response, finalSessionId)
    }
}

export {
    handleWebSocket,
}