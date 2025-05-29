import {WebSocket, WebSocketServer} from 'ws'
import {EventEmitter} from 'node:events'
import http from 'node:http'
import {constructMessage} from './ws-client'
import {logger} from '@garage44/common/app'
import {match} from 'path-to-regexp'


// Core types for the middleware system
export type MessageData = Record<string, unknown>
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface WebSocketContext {
    ws: WebSocket
    wss: WebSocketServer
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
    connections = new Set<WebSocket>()
    routeHandlers: RouteHandler[] = []
    subscriptions: Record<string, Set<WebSocket>> = {}
    clientSubscriptions = new WeakMap<WebSocket, Set<string>>()

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
            matchFn,
            method,
            middlewares,
            route,
        })
    }

    // Broadcast a message to all connections
    broadcast(url: string, data: MessageData, method = 'POST') {
        const message = constructMessage(url, data, undefined, method)
        for (const ws of this.connections) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message))
            }
        }
    }

    // Create a middleware enhancer for WebSocket connections
    chainMiddleware(middleware: any, handler: any) {
        return (ws: WebSocket, req: any) => {
            middleware(req, {} as http.IncomingMessage, () => {
                handler(ws, req)
            })
        }
    }
}

// Add subscription-specific types
export interface SubscriptionContext extends WebSocketContext {
    subscribe: (topic: string) => void
    unsubscribe: (topic: string) => void
}

// Add route type constants for better organization
export const RouteTypes = {
    API: 'api',
}

// Factory function to create a new WebSocket server
export function createWebSocketServer(options: {
    path: string,
    server: http.Server,
    sessionMiddleware?: any,
    authOptions?: {
        noSecurityEnv?: string,
        users?: any[]
    },
}) {
    const manager = new WebSocketServerManager()

    logger.info(`[websocket] creating server: ${options.path}`)
    const wss = new WebSocketServer({
        // noServer: true,
        path: options.path,
        server: options.server,
    })

    const connectionHandler = (ws: WebSocket, req: http.IncomingMessage) => {
        // If using auth and no session or we're not bypassing security
        if (options.authOptions && !req.session &&
            !process.env[options.authOptions.noSecurityEnv || 'GARAGE44_NO_SECURITY']) {
            logger.debug('[websocket] connection denied (unauthorized)')
            ws.close(1008, 'Unauthorized')
            return
        }

        // For development/testing with auth bypassed
        if (options.authOptions && process.env[options.authOptions.noSecurityEnv || 'GARAGE44_NO_SECURITY']) {
            logger.debug('[websocket] connection established (auth bypassed)')
            manager.connections.add(ws)
        } else if (options.authOptions) {
            // Check if user is authenticated via session
            if (!req.session?.userid) {
                logger.debug('[websocket] invalid session or missing userid')
                ws.close(1008, 'Unauthorized')
                return
            }

            // Verify the user exists if users are provided
            if (options.authOptions.users && options.authOptions.users.length > 0) {
                const user = options.authOptions.users.find(u => u.name === req.session.userid)
                if (!user) {
                    logger.debug('[websocket] user not found in config')
                    ws.close(1008, 'Unauthorized')
                    return
                }
            }

            logger.debug(`[websocket] connection established for user: ${req.session.userid}`)
            manager.connections.add(ws)
        } else {
            // No auth required, just add the connection
            manager.connections.add(ws)
        }

        ws.on('message', async(messageData) => {
            try {
                const message = JSON.parse(messageData.toString())
                const {url, data, id, method = 'GET'} = message

                // Create context for this request
                const ctx: WebSocketContext = {
                    broadcast: manager.broadcast.bind(manager),
                    method: method as HttpMethod,
                    session: req.session,
                    url,
                    ws,
                    wss,
                }

                // Find matching route handler
                for (const {matchFn, handler, method: handlerMethod} of manager.routeHandlers) {
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
        })

        ws.on('close', () => {
            manager.connections.delete(ws)
        })
    }

    // Handle the WebSocket connection with or without session middleware
    if (options.sessionMiddleware) {
        wss.on('connection', manager.chainMiddleware(options.sessionMiddleware, connectionHandler))
    } else {
        wss.on('connection', connectionHandler)
    }

    return {
        manager,
        wss,
    }
}
