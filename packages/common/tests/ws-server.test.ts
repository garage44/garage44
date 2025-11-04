import {describe, expect, it} from 'bun:test'

import type {AddressInfo} from 'node:net'
import WebSocket, {WebSocketServer} from 'ws'

import {constructMessage} from '@/lib/ws-client'
import {WebSocketServerManager, type WebSocketContext} from '@/lib/ws-server'

async function createManagedServer(manager: WebSocketServerManager) {
    const sockets = new Map<string, WebSocket>()
    const wss = new WebSocketServer({ path: manager.endpoint, port: 0 })

    await new Promise((resolve) => wss.once('listening', resolve))

    wss.on('connection', (socket, request) => {
        const url = new URL(request.url ?? manager.endpoint, 'http://localhost')
        const user = url.searchParams.get('user') ?? ''

        const session = user ? { userid: user } : undefined
        manager.open(socket, { session })
        sockets.set(user, socket)

        socket.on('message', async(data) => {
            await manager.message(socket, data.toString(), { session })
        })

        socket.on('close', () => {
            manager.close(socket)
            sockets.delete(user)
        })
    })

    const address = wss.address() as AddressInfo
    const url = `ws://127.0.0.1:${address.port}${manager.endpoint}`

    return {
        sockets,
        url,
        close: () => new Promise<void>((resolve, reject) => {
            wss.close((error) => {
                if (error) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        }),
    }
}

async function waitForOpen(ws: WebSocket) {
    if (ws.readyState === WebSocket.OPEN) {
        return
    }
    await new Promise((resolve) => ws.once('open', resolve))
}

async function waitForClose(ws: WebSocket) {
    if (ws.readyState === WebSocket.CLOSED) {
        return
    }
    await new Promise((resolve) => ws.once('close', resolve))
}

function waitForMessage(ws: WebSocket, timeout?: number) {
    return new Promise((resolve, reject) => {
        const handler = (data: WebSocket.RawData) => {
            clearTimeout(timer)
            ws.off('message', handler)
            resolve(JSON.parse(data.toString()))
        }

        const timer = timeout !== undefined ? setTimeout(() => {
            ws.off('message', handler)
            reject(new Error('timeout'))
        }, timeout) : undefined

        ws.on('message', handler)
    })
}

describe('WebSocketServerManager URL routing', () => {
    it('routes messages by URL and HTTP verb, honoring middleware context changes', async() => {
        const manager = new WebSocketServerManager({ endpoint: '/ws' })
        const server = await createManagedServer(manager)
        const client = new WebSocket(`${server.url}?user=alice`)

        await waitForOpen(client)

        let handlerCalls = 0

        manager.api.get('/workspaces/:workspaceId/items/:itemId', async(ctx, request) => {
            handlerCalls++

            const augmented = ctx as WebSocketContext & {tenant?: string}
            expect(augmented.tenant).toBe('alpha')
            expect(request.params).toEqual({ workspaceId: '42', itemId: 'todo' })
            expect(request.data).toEqual({ echo: true })
            expect(ctx.method).toBe('GET')
            expect(ctx.url).toBe('/workspaces/42/items/todo')

            return { status: 'ok', seenBy: augmented.tenant }
        }, [
            async(ctx, next) => {
                const augmentedCtx = ctx as WebSocketContext & {tenant?: string}
                augmentedCtx.tenant = 'alpha'
                return next(augmentedCtx)
            },
        ])

        const requestMessage = constructMessage('/workspaces/42/items/todo', { echo: true }, 'req-1', 'GET')
        client.send(JSON.stringify(requestMessage))

        const response = await waitForMessage(client) as Record<string, unknown>

        expect(handlerCalls).toBe(1)
        expect(response).toEqual({
            data: { status: 'ok', seenBy: 'alpha' },
            id: 'req-1',
            url: '/workspaces/42/items/todo',
        })

        client.close()
        await waitForClose(client)
        await server.close()
    })
})

describe('WebSocketServerManager pub/sub', () => {
    it('publishes events only to subscribed sockets and cleans up on disconnect', async() => {
        const manager = new WebSocketServerManager({ endpoint: '/ws' })
        const server = await createManagedServer(manager)

        const alpha = new WebSocket(`${server.url}?user=alpha`)
        const beta = new WebSocket(`${server.url}?user=beta`)

        await Promise.all([waitForOpen(alpha), waitForOpen(beta)])

        manager.api.post('/topics/:topic/subscribe', async(ctx, request) => {
            ctx.subscribe?.(`topic:${request.params.topic}`)
            return { subscribed: request.params.topic }
        })

        const alphaSubscribe = constructMessage('/topics/alpha/subscribe', undefined, 'sub-1', 'POST')
        alpha.send(JSON.stringify(alphaSubscribe))

        const subscribeAck = await waitForMessage(alpha) as Record<string, unknown>
        expect(subscribeAck).toEqual({
            data: { subscribed: 'alpha' },
            id: 'sub-1',
            url: '/topics/alpha/subscribe',
        })

        manager.emitEvent('topic:alpha', { note: 'first' })
        const firstNotification = await waitForMessage(alpha) as Record<string, unknown>
        expect(firstNotification).toEqual({
            data: { note: 'first' },
            url: 'topic:alpha',
        })

        manager.emitEvent('topic:beta', { note: 'ignored' })
        await expect(waitForMessage(beta, 50)).rejects.toThrow('timeout')

        alpha.close()
        await waitForClose(alpha)
        await new Promise((resolve) => setTimeout(resolve, 10))

        const alphaSubscriptionSize = manager.subscriptions['topic:alpha']?.size ?? 0
        expect(alphaSubscriptionSize).toBe(0)

        manager.emitEvent('topic:alpha', { note: 'after-close' })
        await expect(waitForMessage(beta, 50)).rejects.toThrow('timeout')

        beta.close()
        await waitForClose(beta)
        await server.close()
    })
})
