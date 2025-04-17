import classnames from 'classnames'

// Accepts multiple arguments and types ('', [], {})
// See https://github.com/JedWatson/classnames
export const classes = classnames

export const copyObject = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

export function flattenEnv(obj, parent, res = {}) {
    for (const key of Object.keys(obj)) {
        const propName = (parent ? parent + '_' + key : key).toUpperCase()
        if (typeof obj[key] === 'object') {
            flattenEnv(obj[key], propName, res)
        } else {
            res[`PYR_${propName}`] = obj[key]
        }
    }
    return res
}

/**
 * Pads a string or number with leading characters to reach a specified length.
 *
 * @param {string|number} value - The value to pad
 * @param {number} length - The desired total length
 * @param {string} [char='0'] - The character to pad with (defaults to '0')
 * @returns {string} The padded string
 */
export function padLeft(value: string | number, length: number, char = '0'): string {
    const str = String(value)
    return str.length >= length ? str : (char.repeat(length) + str).slice(-length)
}

export function formatBytes(size) {
    if (size > Math.pow(1024, 3)) {
        return `${Math.round((size / Math.pow(1024, 3)) * 10) / 10}GiB`
    } else if (size > Math.pow(1024, 2)) {
        return `${Math.round((size / Math.pow(1024, 2)) * 10) / 10}MiB`
    } else if (size > 1024) {
        return `${Math.round((size / 1024) * 10) / 10}KiB`
    } else {
        return `${size}B`
    }
}

/**
 * Generates a hash string from a string input that works consistently in both browser and Node environments.
 * Uses FNV-1a algorithm which provides good distribution and low collision rate for string inputs.
 *
 * @param {string} str - The string to hash
 * @returns {string} A 64-bit hex string hash value
 */
export function hash(str: string): string {
    // FNV-1a hash algorithm constants
    let h1 = 0xdeadbeef | 0 // First half
    let h2 = 0x41c6ce57 | 0 // Second half

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        h1 = Math.imul(h1 ^ char, 2654435761)
        h2 = Math.imul(h2 ^ char, 1597334677)
    }

    // Generate 16-char hex string from the two halves
    const hash1 = ((h1 >>> 0).toString(16)).padStart(8, '0')
    const hash2 = ((h2 >>> 0).toString(16)).padStart(8, '0')

    return hash1 + hash2
}

/**
 * Recursively applies a modification function to every key-value pair within an object.
 *
 * @param {Object} reference - The object to be traversed and modified.
 * @param {Function} apply - The modification function to apply. It's called with the reference object, the current key, and the current path.
 * @param {Array} [refPath=[]] - An array representing the current path within the object. Automatically populated during recursion.
 */
export function keyMod(reference, apply, refPath = [], nestingLevel = 0) {
    apply(reference, null, refPath, nestingLevel)

    const keys = Object.keys(reference)
    for (const key of keys) {
        if (key.startsWith('_') || ['src', 'target'].includes(key)) {
            continue
        }
        refPath.push(key)

        if (typeof reference[key] === 'object' && reference[key] !== null) {
            keyMod(reference[key], apply, refPath, nestingLevel + 1)
        } else if (typeof reference[key] === 'string') {
            apply(reference, key, refPath, nestingLevel + 1)
        }
        refPath.pop()
    }
}

/**
 * Accesses or creates a value in an object along a specified path.
 *
 * @param {Object} obj - The object to be accessed or modified.
 * @param {Array} refPath - An array of keys representing the path to be navigated through the object.
 * @param {boolean} [create=false] - Determines whether missing path segments will be created.
 * @returns {any} - The value at the end of the path, or the modified object if segments were created.
 * @throws {Error} If `refPath` is not an array.
 */
export function keyPath(obj, refPath, create = false) {
    if (!Array.isArray(refPath)) throw new Error('refPath must be an array')
    if (!refPath.length) return obj

    const _refPath = [...refPath]
    let _obj = obj
    while (_refPath.length) {
        const key = _refPath.shift()
        if (typeof _obj === 'object' && key in _obj) {
            _obj = _obj[key]
        } else if (create) {
            _obj[key] = {}
            _obj = _obj[key]
        }
    }

    return _obj
}

export function isObject(v) {
    return (v && typeof v === 'object' && !Array.isArray(v))
}

export function mergeDeep(target, ...sources) {
    if (!sources.length) return target
    const source = sources.shift()

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {[key]: {}})
                mergeDeep(target[key], source[key])
            } else {
                Object.assign(target, {[key]: source[key]})
            }
        }
    }

    return mergeDeep(target, ...sources)
}

export function randomId(size = 8) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < size; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

/**
 * Sorts the keys of an object, and recursively sorts the keys of any nested objects.
 *
 * @param {Object|null} obj - The object whose keys are to be sorted. If the input is not an object or is null, it is returned as is.
 * @returns {Object|null} The new object with sorted keys, or the original input if it was not an object.
 */
export function sortNestedObjectKeys(obj) {
    if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
        return obj
    }

    const sortedKeys = Object.keys(obj).sort()

    const sortedObj = {}
    sortedKeys.forEach((key) => {
        const value = obj[key]
        sortedObj[key] = sortNestedObjectKeys(value)
    })

    return sortedObj
}

/**
 * Creates a throttled function that only invokes the provided function at most once per every wait milliseconds.
 *
 * @param {Function} func - The function to throttle.
 * @param {number} wait - The number of milliseconds to throttle invocations to.
 * @returns {Function} The throttled function.
 */
export function throttle(func, wait, options = {trailing: true}) {
    let lastCallTime = 0
    let timeoutId = null

    return function(...args) {
        const now = Date.now()
        const remainingTime = wait - (now - lastCallTime)

        if (remainingTime <= 0) {
            if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null
            }
            lastCallTime = now
            func.apply(this, args)
        } else if (!timeoutId && options.trailing) {
            timeoutId = setTimeout(() => {
                lastCallTime = Date.now()
                timeoutId = null
                func.apply(this, args)
            }, remainingTime)
        }
    }
}
