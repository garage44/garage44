type HttpEvent = {
  ts: number
  method: string
  url: string
  status?: number
  ms?: number
}

type WsEvent = {
  ts: number
  endpoint: string
  type: 'open' | 'close' | 'message' | 'broadcast'
  url?: string
  dataPreview?: string
}

type LogEvent = {
  ts: number
  level: string
  message: string
}

class RingBuffer<T> {
  #buf: T[] = []
  #cap: number
  constructor(capacity: number) { this.#cap = capacity }
  push(item: T) {
    this.#buf.push(item)
    if (this.#buf.length > this.#cap) { this.#buf.shift() }
  }
  toArray(): T[] { return [...this.#buf] }
}

class DevContext {
    http = new RingBuffer<HttpEvent>(500)
    ws = new RingBuffer<WsEvent>(500)
    logs = new RingBuffer<LogEvent>(500)
    errors = new RingBuffer<LogEvent>(200)

    addHttp(e: HttpEvent) { this.http.push(e) }
    addWs(e: WsEvent) { this.ws.push(e) }
    addLog(level: string, message: string) {
      const evt = { ts: Date.now(), level, message }
      if (level === 'error') { this.errors.push(evt) } else { this.logs.push(evt) }
    }

    snapshot(extra: Record<string, unknown> = {}) {
        return {
            ts: Date.now(),
            http: this.http.toArray(),
            ws: this.ws.toArray(),
            logs: this.logs.toArray(),
            errors: this.errors.toArray(),
            ...extra,
        }
    }
}

export const devContext = new DevContext()
