import path from 'node:path'

// Create a simple session store for Bun.serve
const sessions = new Map()

// These endpoints are allowed to bypass the authentication middleware:
const endpointAllowList = [
    '/api/context',
    '/api/translations',
    '/api/login',
]

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

// Simple session middleware for Bun.serve
const sessionMiddleware = (request: Request) => {
    const cookies = parseCookies(request)
    const sessionId = cookies['expressio-session']

    if (!sessionId || !sessions.has(sessionId)) {
        const newSessionId = crypto.randomUUID()
        const session = { userid: null }
        sessions.set(newSessionId, session)
        return { session, sessionId: newSessionId }
    }

    return { session: sessions.get(sessionId), sessionId }
}

// WebSocket handler for Bun.serve
const handleWebSocket = (ws: any, request: Request) => {
    // Handle WebSocket connections
    // This will be enhanced by the WebSocket server implementation
}


// Auth middleware for Bun.serve
const authMiddleware = (request: Request, session: any, config) => {
    const url = new URL(request.url)

    if (!url.pathname.startsWith('/api')) {
        return true
    }

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

    if (process.env.GARAGE44_NO_SECURITY) {
        // Find the first admin user and set their userid in the session
        const adminUser = config.users.find(user => user.admin)
        if (adminUser) {
            session.userid = adminUser.name
        }
        return true
    }

    return false
}

// Request handler for Bun.serve
const handleRequest = async (request: Request, config, logger, bunchyConfig): Promise<Response | null> => {
    const url = new URL(request.url)

    // Log request
    logger.info(`${request.method} ${url.pathname}`)

    // Handle session and auth
    const {session} = sessionMiddleware(request)

    if (!authMiddleware(request, session, config)) {
        return new Response('Unauthorized', { status: 401 })
    }

    // Handle development static files
    if (process.env.BUN_ENV === 'development') {
        if (url.pathname.startsWith('/common/')) {
            const filePath = path.join(bunchyConfig.common, url.pathname.replace('/common', ''))
            try {
                const file = Bun.file(filePath)
                if (await file.exists()) {
                    return new Response(file)
                }
            } catch (error) {
                logger.debug(`[HTTP] static file not found: ${filePath} (${error})`)
                // File doesn't exist, continue
            }
        }

        if (url.pathname.startsWith('/src/')) {
            const filePath = path.join(bunchyConfig.workspace, 'src', url.pathname.replace('/src', ''))
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

export {
    handleRequest,
    handleWebSocket
}