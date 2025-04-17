import {WebSocketServerManager, createWebSocketServer} from '@garage44/common/lib/ws-server'
import {Server} from 'node:http'
import {WebSocket} from 'ws'
import {getSession} from '@garage44/common/lib/middleware'

// Re-export the types and functions from the common implementation
export * from '@garage44/common/lib/ws-server'

// Keep a reference to the server manager for Expressio-specific functionality
let serverManager: WebSocketServerManager | null = null

export const initWebSocketServer = (app, config) => {
    const server = new Server(app)

    // Create a WebSocket server using the common implementation
    const {manager} = createWebSocketServer({
        authOptions: {
            noSecurityEnv: 'GARAGE44_NO_SECURITY',
            users: config.users,
        },
        path: '/ws',
        server,
        sessionMiddleware: getSession(config),
    })

    // Store reference to the manager
    serverManager = manager

    return server
}

// For backward compatibility, re-export connections from the manager
export const connections = {
    add: (ws: WebSocket) => serverManager?.connections.add(ws),
    delete: (ws: WebSocket) => serverManager?.connections.delete(ws),
    has: (ws: WebSocket) => serverManager?.connections.has(ws),
    get size() { return serverManager?.connections.size || 0 },
    [Symbol.iterator]: function*() {
        if (!serverManager) return
        yield* serverManager.connections
    },
} as Set<WebSocket>

// For backward compatibility, re-export broadcast from the manager
export const broadcast = (url: string, data: unknown, method = 'POST') => {
    serverManager?.broadcast(url, data, method)
}

// For backward compatibility, re-export emitEvent from the manager
export function emitEvent(topic: string, data: unknown): void {
    serverManager?.emitEvent(topic, data)
}

// For backward compatibility, re-export API functions
export const api = {
    delete: (route: string, handler: any, middlewares?: any[]) =>
        serverManager?.api.delete(route, handler, middlewares),
    get: (route: string, handler: any, middlewares?: any[]) =>
        serverManager?.api.get(route, handler, middlewares),
    post: (route: string, handler: any, middlewares?: any[]) =>
        serverManager?.api.post(route, handler, middlewares),
    put: (route: string, handler: any, middlewares?: any[]) =>
        serverManager?.api.put(route, handler, middlewares),
}
