import {EventEmitter} from 'node:events'
import {constructMessage} from './ws-client'
import {logger} from '../app'
import {match} from 'path-to-regexp'

// Core types for the middleware system
type MessageData = Record<string, unknown>
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface WebSocketContext {
    ws: any // Bun WebSocket or standard WebSocket
    session?: {
        userid: string
        [key: string]: unknown
    }
    method: HttpMethod
    url: string
    broadcast: (url: string, data: MessageData, method?: string) => void
    subscribe?: (topic: string) => void
    unsubscribe?: (topic: string) => void
}

interface ApiRequest {
    params: Record<string, string>
    query?: Record<string, unknown>
    data?: MessageData
    id?: string
}

type Next = (ctx: WebSocketContext) => Promise<unknown>
type Middleware = (ctx: WebSocketContext, next: Next) => Promise<unknown>
type ApiHandler = (ctx: WebSocketContext, request: ApiRequest) => Promise<unknown>

interface RouteHandler {
    route: string
    method: HttpMethod
    matchFn: (path: string) => false | { params: Record<string, string> }
    handler: ApiHandler
    middlewares: Middleware[]
}

interface WebSocketServerOptions {
    endpoint: string
    sessionMiddleware?: any
    authOptions?: {
        noSecurityEnv?: string
        users?: {name: string, [key: string]: unknown}[]
    }
    globalMiddlewares?: Middleware[]
}

// WebSocket Server Manager - handles a single WebSocket endpoint
class WebSocketServerManager extends EventEmitter {
    connections = new Set<any>()
    routeHandlers: RouteHandler[] = []
    subscriptions: Record<string, Set<any>> = {}
    clientSubscriptions = new WeakMap<any, Set<string>>()
    endpoint: string
    authOptions?: WebSocketServerOptions['authOptions']
    sessionMiddleware?: any

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

    constructor(options: WebSocketServerOptions) {
        super()
        this.endpoint = options.endpoint
        this.authOptions = options.authOptions
        this.sessionMiddleware = options.sessionMiddleware

        // Add custom global middlewares if provided
        if (options.globalMiddlewares) {
            this.globalMiddlewares.push(...options.globalMiddlewares)
        }
    }

    // Middleware composition helper
    composeMiddleware(middlewares: Middleware[], handler: ApiHandler): ApiHandler {
        return (ctx, request) => {
            let index = -1

            const dispatch = (_index: number) => {
                if (_index <= index) {
                    throw new Error('next() called multiple times')
                }
                index = _index

                const middleware = _index === middlewares.length ?
                    ((ctx) => handler(ctx, request)) :
                    middlewares[_index]

                return middleware(ctx, (_ctx) => dispatch(_index + 1))
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
                if (result === false) {
                    return false
                }
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

    // Subscription management
    subscribe(ws: any, topic: string) {
        if (!this.subscriptions[topic]) {
            this.subscriptions[topic] = new Set()
        }
        this.subscriptions[topic].add(ws)

        if (!this.clientSubscriptions.has(ws)) {
            this.clientSubscriptions.set(ws, new Set())
        }
        this.clientSubscriptions.get(ws)!.add(topic)
    }

    unsubscribe(ws: any, topic: string) {
        this.subscriptions[topic]?.delete(ws)
        this.clientSubscriptions.get(ws)?.delete(topic)
    }

    // Clean up subscriptions when connection closes
    cleanupSubscriptions(ws: any) {
        const topics = this.clientSubscriptions.get(ws)
        if (topics) {
            for (const topic of topics) {
                this.subscriptions[topic]?.delete(ws)
            }
            this.clientSubscriptions.delete(ws)
        }
    }

    // Broadcast a message to all connections
    broadcast(url: string, data: MessageData, method = 'POST') {
        const message = constructMessage(url, data, undefined, method)
        for (const ws of this.connections) {
            if (ws.readyState === 1) { // OPEN state for Bun WebSocket
                ws.send(JSON.stringify(message))
            }
        }
    }

    // Emit event to subscribed connections
    emitEvent(topic: string, data: unknown): void {
        const message = constructMessage(topic, data as MessageData)
        const subscribers = this.subscriptions[topic]
        if (subscribers) {
            for (const ws of subscribers) {
                if (ws.readyState === 1) { // OPEN state
                    ws.send(JSON.stringify(message))
                }
            }
        }
    }

    // Check authentication for a request
    private checkAuth(request: any): boolean {
        if (!this.authOptions) {
            return true
        }

        // Check if auth is bypassed via environment variable
        if (process.env[this.authOptions.noSecurityEnv || 'GARAGE44_NO_SECURITY']) {
            return true
        }

        // Check session
        if (!request.session?.userid) {
            return false
        }

        // Verify user exists if users list is provided
        if (this.authOptions.users && this.authOptions.users.length > 0) {
            const user = this.authOptions.users.find(u => u.name === request.session.userid)
            return !!user
        }

        return true
    }

    // Handle WebSocket connection open
    open(ws: any, request?: any) {
        // Check authentication if required
        if (this.authOptions && !this.checkAuth(request)) {
            logger.warn(`[WS] connection denied (unauthorized) on ${this.endpoint}`)
            ws.close(1008, 'Unauthorized')
            return
        }

        logger.success(`[WS] connection established: ${this.endpoint}`)
        this.connections.add(ws)
    }

    // Handle WebSocket connection close
    close(ws: any) {
        logger.debug(`[WS] connection closed: ${this.endpoint}`)
        this.connections.delete(ws)
        this.cleanupSubscriptions(ws)
    }

    // Handle WebSocket message
    async message(ws: any, message: string, request?: any) {
        try {
            const parsedMessage = JSON.parse(message)
            const {url, data, id, method = 'GET'} = parsedMessage

            // Create context for this request
            const ctx: WebSocketContext = {
                broadcast: this.broadcast.bind(this),
                method: method as HttpMethod,
                session: request?.session,
                subscribe: (topic: string) => this.subscribe(ws, topic),
                unsubscribe: (topic: string) => this.unsubscribe(ws, topic),
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
                        const errorResponse = constructMessage(url, {error: error.message}, id)
                        ws.send(JSON.stringify(errorResponse))
                        logger.error('handler error:', error)
                    }
                    break
                }
            }
        } catch (error) {
            logger.error('Error processing WebSocket message:', error)
        }
    }
}

// Create Bun.serve compatible WebSocket handlers that dispatch to multiple managers
function createBunWebSocketHandler(managers: Map<string, WebSocketServerManager>) {
    return {
        close: (ws: any) => {
            const endpoint = ws.data?.endpoint
            const manager = managers.get(endpoint)
            if (manager) {
                manager.close(ws)
            }
        },
        message: (ws: any, message: string) => {
            const endpoint = ws.data?.endpoint
            const manager = managers.get(endpoint)
            if (manager) {
                manager.message(ws, message, ws.data)
            }
        },
        open: (ws: any) => {
            const endpoint = ws.data?.endpoint
            const manager = managers.get(endpoint)
            if (manager) {
                manager.open(ws, ws.data)
            } else {
                logger.error(`[WS] no manager found for endpoint: ${endpoint}`)
                ws.close(1011, 'Server Error')
            }
        },
    }
}

// Note: broadcast, emitEvent, and connections are now managed per WebSocketServerManager instance
// Each package should use their own manager instances directly

// Legacy exports for backward compatibility
type SubscriptionContext = WebSocketContext
const RouteTypes = {API: 'api'} as const

export {
    createBunWebSocketHandler,
    RouteTypes,
    SubscriptionContext,
    WebSocketServerManager,
    type ApiRequest,
    type ApiHandler,
    type HttpMethod,
    type MessageData,
    type Middleware,
    type Next,
    type RouteHandler,
    type WebSocketContext,
    type WebSocketServerOptions,
}