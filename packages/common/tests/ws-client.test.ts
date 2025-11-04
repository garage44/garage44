import {beforeEach, describe, expect, it, afterEach} from 'bun:test'

import {WebSocketClient} from '@/lib/ws-client'

type MessagePayload = {
    data?: Record<string, unknown>
    id?: string
    method?: string
    url: string
}

class FakeWebSocket {
    static instances: FakeWebSocket[] = []
    static CONNECTING = 0
    static OPEN = 1
    static CLOSING = 2
    static CLOSED = 3

    onclose: ((event: {code: number, reason: string}) => void) | null = null
    onerror: ((event: unknown) => void) | null = null
    onmessage: ((event: {data: string}) => void) | null = null
    onopen: (() => void) | null = null
    readyState = FakeWebSocket.CONNECTING
    sent: MessagePayload[] = []

    constructor(public url: string) {
        FakeWebSocket.instances.push(this)
    }

    addEventListener() {}
    removeEventListener() {}

    send(data: string) {
        this.sent.push(JSON.parse(data))
    }

    triggerOpen() {
        this.readyState = FakeWebSocket.OPEN
        this.onopen?.()
    }

    triggerClose(event: {code: number, reason: string} = {code: 1000, reason: ''}) {
        this.readyState = FakeWebSocket.CLOSED
        this.onclose?.(event)
    }

    close(code = 1000, reason = '') {
        this.triggerClose({code, reason})
    }

    triggerMessage(payload: MessagePayload) {
        this.onmessage?.({data: JSON.stringify(payload)})
    }
}

const OriginalWebSocket = globalThis.WebSocket

beforeEach(() => {
    FakeWebSocket.instances = []
    // @ts-expect-error override for tests
    globalThis.WebSocket = FakeWebSocket
})

afterEach(() => {
    // @ts-expect-error restore override
    globalThis.WebSocket = OriginalWebSocket
})

describe('WebSocketClient', () => {
    it('queues requests until the connection opens and resolves responses', async() => {
        const client = new WebSocketClient('ws://example.test/ws')

        const pending = client.post('/tasks/reload', {hash: 'abc'})

        client.connect()
        const socket = FakeWebSocket.instances.at(-1)!

        expect(socket.readyState).toBe(FakeWebSocket.CONNECTING)
        expect(socket.sent).toHaveLength(0)

        socket.triggerOpen()

        expect(socket.readyState).toBe(FakeWebSocket.OPEN)
        expect(socket.sent).toHaveLength(1)

        const outbound = socket.sent[0]
        expect(outbound.method).toBe('POST')
        expect(outbound.url).toBe('/tasks/reload')

        socket.triggerMessage({
            data: {status: 'ok'},
            id: outbound.id,
            url: '/tasks/reload',
        })

        const response = await pending
        expect(response).toEqual({status: 'ok'})

        client.close()
    })

    it('invokes registered route handlers when messages arrive', () => {
        const client = new WebSocketClient('ws://example.test/ws')
        client.connect()
        const socket = FakeWebSocket.instances.at(-1)!
        socket.triggerOpen()

        const received: MessagePayload[] = []
        client.onRoute('/hot-reload', (data) => {
            received.push({data, url: '/hot-reload'})
        })

        socket.triggerMessage({url: '/hot-reload', data: {timestamp: 123}})

        expect(received).toHaveLength(1)
        expect(received[0].data).toEqual({timestamp: 123})

        client.close()
    })
})
