import classnames from 'classnames'

// Accepts multiple arguments and types ('', [], {})
// See https://github.com/JedWatson/classnames
export const classes = classnames

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

export const copyObject = (obj) => {
    return JSON.parse(JSON.stringify(obj))
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
