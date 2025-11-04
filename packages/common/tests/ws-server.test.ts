import {describe, expect, it} from 'bun:test'

import {constructMessage} from '@/lib/ws-client'
import {WebSocketServerManager, type WebSocketContext} from '@/lib/ws-server'

class MockWebSocket {
    closeCalls: {code?: number, reason?: string}[] = []
    readyState = 1
    sent: string[] = []

    close(code?: number, reason?: string) {
        this.readyState = 3
        this.closeCalls.push({code, reason})
    }

    send(payload: string) {
        this.sent.push(payload)
    }
}

describe('WebSocketServerManager URL routing', () => {
    it('routes messages by URL and HTTP verb, honoring middleware context changes', async() => {
        const manager = new WebSocketServerManager({ endpoint: '/ws' })
        const ws = new MockWebSocket()

        manager.open(ws, { session: { userid: 'alice' } })

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
                const augmentedCtx = { ...ctx, tenant: 'alpha' } as WebSocketContext
                return next(augmentedCtx)
            },
        ])

        const requestMessage = constructMessage('/workspaces/42/items/todo', { echo: true }, 'req-1', 'GET')
        await manager.message(ws, JSON.stringify(requestMessage), { session: { userid: 'alice' } })

        expect(handlerCalls).toBe(1)

        expect(ws.sent).toHaveLength(1)
        expect(JSON.parse(ws.sent[0])).toEqual({
            data: { status: 'ok', seenBy: 'alpha' },
            id: 'req-1',
            url: '/workspaces/42/items/todo',
        })
    })
})

describe('WebSocketServerManager pub/sub', () => {
    it('publishes events only to subscribed sockets and cleans up on disconnect', async() => {
        const manager = new WebSocketServerManager({ endpoint: '/ws' })
        const alphaWs = new MockWebSocket()
        const betaWs = new MockWebSocket()

        manager.open(alphaWs, { session: { userid: 'alpha' } })
        manager.open(betaWs, { session: { userid: 'beta' } })

        manager.api.post('/topics/:topic/subscribe', async(ctx, request) => {
            ctx.subscribe?.(`topic:${request.params.topic}`)
            return { subscribed: request.params.topic }
        })

        const alphaSubscribe = constructMessage('/topics/alpha/subscribe', undefined, 'sub-1', 'POST')
        await manager.message(alphaWs, JSON.stringify(alphaSubscribe), { session: { userid: 'alpha' } })

        expect(JSON.parse(alphaWs.sent[0])).toEqual({
            data: { subscribed: 'alpha' },
            id: 'sub-1',
            url: '/topics/alpha/subscribe',
        })

        manager.emitEvent('topic:alpha', { note: 'first' })
        expect(alphaWs.sent).toHaveLength(2)
        expect(JSON.parse(alphaWs.sent[1])).toEqual({
            data: { note: 'first' },
            url: 'topic:alpha',
        })

        manager.emitEvent('topic:beta', { note: 'ignored' })
        expect(betaWs.sent).toHaveLength(0)

        manager.close(alphaWs)
        manager.emitEvent('topic:alpha', { note: 'after-close' })

        expect(alphaWs.sent).toHaveLength(2)
    })
})
