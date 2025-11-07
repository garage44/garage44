import {describe, expect, it} from 'bun:test'

import {source as sourceLanguages} from '../languages'

describe('enola languages catalogue', () => {
    it('exposes at least one language with iso metadata', () => {
        expect(sourceLanguages.length).toBeGreaterThan(0)
        const [first] = sourceLanguages
        expect(first).toHaveProperty('id')
        expect(first).toHaveProperty('name')
    })
})
