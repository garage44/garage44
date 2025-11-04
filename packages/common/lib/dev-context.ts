type HttpEvent = {
    method: string
    ms?: number
    status?: number
    ts: number
    url: string
}

type WsEvent = {
    dataPreview?: string
    endpoint: string
    ts: number
    type: 'open' | 'close' | 'message' | 'broadcast'
    url?: string
}

type LogEvent = {
    level: string
    message: string
    ts: number
}

type RingBuffer<T> = {
    push: (item: T) => void
    toArray: () => T[]
}

function createRingBuffer<T>(capacity: number): RingBuffer<T> {
    const buffer: T[] = []

    return {
        push(item: T) {
            buffer.push(item)
            if (buffer.length > capacity) {
                buffer.shift()
            }
        },
        toArray(): T[] {
            return [...buffer]
        },
    }
}

class DevContext {
    http = createRingBuffer<HttpEvent>(500)
    ws = createRingBuffer<WsEvent>(500)
    logs = createRingBuffer<LogEvent>(500)
    errors = createRingBuffer<LogEvent>(200)

    addHttp(e: HttpEvent) {
        this.http.push(e)
    }
    addWs(e: WsEvent) {
        this.ws.push(e)
    }
    addLog(level: string, message: string) {
        const evt = {level, message, ts: Date.now()}
        if (level === 'error') {
            this.errors.push(evt)
        } else {
            this.logs.push(evt)
        }
    }

    snapshot(extra: Record<string, unknown> = {}) {
        return {
            errors: this.errors.toArray(),
            http: this.http.toArray(),
            logs: this.logs.toArray(),
            ts: Date.now(),
            ws: this.ws.toArray(),
            ...extra,
        }
    }
}

export const devContext = new DevContext()
