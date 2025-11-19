export class RingBuffer<T> {
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
