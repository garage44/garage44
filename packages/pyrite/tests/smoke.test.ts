import {describe, expect, it} from 'bun:test'

describe('pyrite smoke test', () => {
    it('runs a trivial assertion', () => {
        expect(true).toBe(true)
    })
})
