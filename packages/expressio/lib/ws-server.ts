import {EventEmitter} from 'node:events'
import {constructMessage} from '@garage44/common/lib/ws-client'
import {logger} from '../service.ts'
import {match} from 'path-to-regexp'

// Core types for the middleware system
export type MessageData = Record<string, unknown>
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface WebSocketContext {
    ws: any // Bun WebSocket
    session?: {
        userid: string
        [key: string]: unknown
    }
    method: HttpMethod
    url: string
    broadcast: (url: string, data: MessageData, method?: string) => void
}

export interface ApiRequest {
    params: Record<string, string>
    query?: Record<string, unknown>
    data?: MessageData
    id?: string
}

export type Next = (ctx: WebSocketContext) => Promise<unknown>
export type Middleware = (ctx: WebSocketContext, next: Next) => Promise<unknown>
export type ApiHandler = (ctx: WebSocketContext, request: ApiRequest) => Promise<unknown>

export interface RouteHandler {
    route: string
    method: HttpMethod
    matchFn: (path: string) => false | { params: Record<string, string> }
    handler: ApiHandler
    middlewares: Middleware[]
}

// Keep track of connections per server to avoid global state
export class WebSocketServerManager extends EventEmitter {
    connections = new Set<any>() // Bun WebSocket connections
    routeHandlers: RouteHandler[] = []
    subscriptions: Record<string, Set<any>> = {}
    clientSubscriptions = new WeakMap<any, Set<string>>()

    // Global middlewares that will be applied to all routes
    globalMiddlewares: Middleware[] = [
        // Logging middleware
        async(ctx, next) => {
            const startTime = Date.now()
            try {
                const result = await next(ctx)
                logger.debug(`${ctx.method} ${ctx.url} - ${Date.now() - startTime}ms`)
                return result
            } catch (error) {
                logger.error(`${ctx.method} ${ctx.url} - Failed: ${error.message}`)
                throw error
            }
        },
    ]

    // Create API registration convenience methods
    api = {
        delete: (route: string, handler: ApiHandler, middlewares?: Middleware[]) =>
            this.registerApi('DELETE', route, handler, middlewares),
        get: (route: string, handler: ApiHandler, middlewares?: Middleware[]) =>
            this.registerApi('GET', route, handler, middlewares),
        post: (route: string, handler: ApiHandler, middlewares?: Middleware[]) =>
            this.registerApi('POST', route, handler, middlewares),
        put: (route: string, handler: ApiHandler, middlewares?: Middleware[]) =>
            this.registerApi('PUT', route, handler, middlewares),
    }

    constructor() {
        super()
    }

    // Middleware composition helper
    composeMiddleware(middlewares: Middleware[], handler: ApiHandler): ApiHandler {
        return async(ctx, request) => {
            let index = -1

            const dispatch = async(i: number): Promise<unknown> => {
                if (i <= index) throw new Error('next() called multiple times')
                index = i

                const middleware = i === middlewares.length ?
                    ((ctx) => handler(ctx, request)) :
                    middlewares[i]

                return middleware(ctx, (ctx) => dispatch(i + 1))
            }

            return dispatch(0)
        }
    }

    // Main registration function for APIs
    registerApi(method: HttpMethod, route: string, handler: ApiHandler, middlewares: Middleware[] = []) {
        const matchFn = match(route, {decode: decodeURIComponent})
        this.routeHandlers.push({
            handler: this.composeMiddleware([...this.globalMiddlewares, ...middlewares], handler),
            matchFn: (path: string) => {
                const result = matchFn(path)
                if (result === false) return false
                // Convert params to Record<string, string>
                const params: Record<string, string> = {}
                for (const [key, value] of Object.entries(result.params)) {
                    params[key] = Array.isArray(value) ? value[0] : value
                }
                return { params }
            },
            method,
            middlewares,
            route,
        })
    }

    // Broadcast a message to all connections
    broadcast(url: string, data: MessageData, method = 'POST') {
        const message = constructMessage(url, data, undefined, method)
        for (const ws of this.connections) {
            if (ws.readyState === 1) { // OPEN state
                ws.send(JSON.stringify(message))
            }
        }
    }

    // Emit event to all connections
    emitEvent(topic: string, data: unknown): void {
        const message = constructMessage(topic, data as MessageData)
        for (const ws of this.connections) {
            if (ws.readyState === 1) { // OPEN state
                ws.send(JSON.stringify(message))
            }
        }
    }

    // Instance method for handling open
    open(ws: any) {
        logger.debug('[websocket] connection established')
        this.connections.add(ws)
    }

    // Instance method for handling close
    close(ws: any) {
        logger.debug('[websocket] connection closed')
        this.connections.delete(ws)
    }

    // Instance method for handling message
    async message(ws: any, message: string) {
        try {
            const parsedMessage = JSON.parse(message)
            const {url, data, id, method = 'GET'} = parsedMessage

            // Create context for this request
            const ctx: WebSocketContext = {
                broadcast: this.broadcast.bind(this),
                method: method as HttpMethod,
                session: null, // Session handling will be implemented later
                url,
                ws,
            }

            // Find matching route handler
            for (const {matchFn, handler, method: handlerMethod} of this.routeHandlers) {
                const matchResult = matchFn(url)

                // Check both URL pattern match AND matching HTTP method
                if (matchResult !== false && handlerMethod === method) {
                    try {
                        const request: ApiRequest = {
                            data,
                            id,
                            params: matchResult.params,
                        }

                        const result = await handler(ctx, request)
                        // Always respond to messages with an ID
                        if (id) {
                            const response = constructMessage(url, (result as MessageData) || null, id)
                            ws.send(JSON.stringify(response))
                        }
                    } catch (error) {
                        const errorResponse = constructMessage(url, {
                            error: error.message,
                        }, id)
                        ws.send(JSON.stringify(errorResponse))
                        logger.error('Handler error:', error)
                    }
                    break
                }
            }
        } catch (error) {
            logger.error('Error processing WebSocket message:', error)
        }
    }
}

// Two separate managers for /ws and /bunchy
let wsManager: WebSocketServerManager | null = null
let bunchyManager: WebSocketServerManager | null = null

export const apiWs = {
    delete: function(...args: any[]) { return wsManager?.api.delete.apply(wsManager?.api, args) },
    get: function(...args: any[]) { return wsManager?.api.get.apply(wsManager?.api, args) },
    post: function(...args: any[]) { return wsManager?.api.post.apply(wsManager?.api, args) },
    put: function(...args: any[]) { return wsManager?.api.put.apply(wsManager?.api, args) },
}

export const apiBunchy = {
    delete: function(...args: any[]) { return bunchyManager?.api.delete.apply(bunchyManager?.api, args) },
    get: function(...args: any[]) { return bunchyManager?.api.get.apply(bunchyManager?.api, args) },
    post: function(...args: any[]) { return bunchyManager?.api.post.apply(bunchyManager?.api, args) },
    put: function(...args: any[]) { return bunchyManager?.api.put.apply(bunchyManager?.api, args) },
}

export const initDualWebSocketServer = (handleWebSocket: any, config: any) => {
    wsManager = new WebSocketServerManager()
    bunchyManager = new WebSocketServerManager()

    // Return a Bun.serve websocket handler that dispatches by endpoint
    return {
        open: (ws: any) => {
            const endpoint = ws.data?.endpoint
            if (endpoint === '/ws') {
                if (wsManager) wsManager.open(ws)
                else logger.error('[websocket] wsManager not initialized')
            } else if (endpoint === '/bunchy') {
                if (bunchyManager) bunchyManager.open(ws)
                else logger.error('[websocket] bunchyManager not initialized')
            }
        },
        close: (ws: any) => {
            const endpoint = ws.data?.endpoint
            if (endpoint === '/ws') {
                if (wsManager) wsManager.close(ws)
                else logger.error('[websocket] wsManager not initialized')
            } else if (endpoint === '/bunchy') {
                if (bunchyManager) bunchyManager.close(ws)
                else logger.error('[websocket] bunchyManager not initialized')
            }
        },
        message: (ws: any, message: string) => {
            const endpoint = ws.data?.endpoint
            if (endpoint === '/ws') {
                if (wsManager) wsManager.message(ws, message)
                else logger.error('[websocket] wsManager not initialized')
            } else if (endpoint === '/bunchy') {
                if (bunchyManager) bunchyManager.message(ws, message)
                else logger.error('[websocket] bunchyManager not initialized')
            }
        },
    }
}

// Helper function to parse cookies
const parseCookies = (request: Request) => {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return {}

    const cookies: Record<string, string> = {}
    cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=')
        if (name && value) {
            cookies[name] = decodeURIComponent(value)
        }
    })
    return cookies
}

// For backward compatibility, re-export connections from the manager
export const connections = {
    add: (ws: any) => wsManager?.connections.add(ws) || bunchyManager?.connections.add(ws),
    delete: (ws: any) => wsManager?.connections.delete(ws) || bunchyManager?.connections.delete(ws),
    has: (ws: any) => wsManager?.connections.has(ws) || bunchyManager?.connections.has(ws),
    get size() { return (wsManager?.connections.size || 0) + (bunchyManager?.connections.size || 0) },
    [Symbol.iterator]: function*() {
        if (!wsManager && !bunchyManager) return
        if (wsManager) yield* wsManager.connections
        if (bunchyManager) yield* bunchyManager.connections
    },
} as Set<any>

// For backward compatibility, re-export broadcast from the manager
export const broadcast = (url: string, data: unknown, method = 'POST') => {
    wsManager?.broadcast(url, data as MessageData, method)
    bunchyManager?.broadcast(url, data as MessageData, method)
}

// For backward compatibility, re-export emitEvent from the manager
export function emitEvent(topic: string, data: unknown): void {
    wsManager?.emitEvent(topic, data)
    bunchyManager?.emitEvent(topic, data)
}
