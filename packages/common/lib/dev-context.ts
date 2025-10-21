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

class RingBuffer<T> {
    #buf: T[] = []
    #cap: number
    constructor(capacity: number) {
        this.#cap = capacity 
    }
    push(item: T) {
        this.#buf.push(item)
        if (this.#buf.length > this.#cap) {
            this.#buf.shift() 
        }
    }
    toArray(): T[] {
        return [...this.#buf] 
    }
}

class DevContext {
    http = new RingBuffer<HttpEvent>(500)
    ws = new RingBuffer<WsEvent>(500)
    logs = new RingBuffer<LogEvent>(500)
    errors = new RingBuffer<LogEvent>(200)

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
