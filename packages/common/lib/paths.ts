import {keyMod, keyPath, mergeDeep} from '@garage44/common/lib/utils'
import {EnolaTag} from '@garage44/enola/types.ts'
import {TargetLanguage} from '@garage44/common/types.ts'
import {hash} from '@garage44/common/lib/utils.ts'
import {logger} from '@garage44/common/app'

export function collectSource(source, path, ignore_cache = false) {
    const cachedValues = []
    const sourceValues = []

    function traverse(current, path) {
        if (typeof current !== 'object' || current === null) {
            return
        }

        if ('source' in current && typeof current.source === 'string') {
            if (ignore_cache) {
                sourceValues.push([current, path])
            } else {
                if (current.cache === hash(current.source)) {
                    cachedValues.push(current)
                } else {
                    sourceValues.push([current, path])
                }
            }
        }

        for (const key in current) {
            traverse(current[key], [...path, key])
        }
    }

    const {id, ref} = pathRef(source, path)
    traverse(ref[id], path)
    return {
        cached: cachedValues,
        targets: sourceValues,
    }
}

/**
 * Create a new object in a path.
 * @param source
 * @param path
 * @param value
 * @param targetLanguages
 * @returns
 */
export function pathCreate(sourceObject:Record<string, unknown>, tagPath:string[], value:EnolaTag, targetLanguages:TargetLanguage[], translations?:Record<string, string>) {
    const {id, ref} = pathRef(sourceObject, tagPath, true)
    ref[id] = value

    const tag = tagPath.join('.')
    ref[id]._id = id
    ref[id]._collapsed = true

    // Set _id and _collapsed for each intermediate path object
    for (let i = 0; i < tagPath.length - 1; i++) {
        const partialPath = tagPath.slice(0, i + 1)
        const {id: segmentId, ref: segmentRef} = pathRef(sourceObject, partialPath)

        // Set properties directly on the object
        if (segmentRef[segmentId] && typeof segmentRef[segmentId] === 'object') {
            if (!('_id' in segmentRef[segmentId])) segmentRef[segmentId]._id = segmentId
            if (!('_collapsed' in segmentRef[segmentId])) segmentRef[segmentId]._collapsed = false
        }
    }

    if ('source' in value) {
        // This is a tag; add placeholders for each target language
        ref[id].target = {}

        if ('_soft' in value) {
            ref[id]._soft = value._soft
        }
        logger.info(`create path tag: ${tag} ${'_soft' in value ? '(soft create)' : ''}`)
        targetLanguages.map(async(language) => {
            if (translations && translations[language.id]) {
                ref[id].target[language.id] = translations[language.id]
            } else {
                ref[id].target[language.id] = id
            }
        })
    } else {
        logger.info(`create path group: ${tag}`)
    }

    return {id, ref}
}

export function pathDelete(source, path) {
    const {id, ref} = pathRef(source, path)
    delete ref[id]
    logger.info(`delete path: ${path}`)
}

export function pathHas(source, path, key) {
    const {id, ref} = pathRef(source, path)
    let has_key = false
    if (ref[id]) {
        keyMod(ref[id], (sourceRef) => {
            if (key in sourceRef) {
                has_key = true
            }
        })
    }

    return has_key
}

/**
 * Toggles collapse state for nodes in the path tree.
 * @param {Object} source - The source object to modify
 * @param {Array} path - Path to the target node
 * @param {Object} modifier - Modifications to apply (typically {_collapsed: boolean})
 * @param {string} mode - How to apply the change: 'self' (target only), 'groups' (target+nested groups), 'all' (target+all nested)
 */
export function pathToggle(source, path, modifier, mode: 'self' | 'groups' | 'all' = 'groups') {
    if (!modifier) return

    // Handle empty path (root level)
    if (!path || path.length === 0) {
        // Apply to root node
        mergeDeep(source, modifier)

        // Recursively apply changes based on mode
        if (mode !== 'self') {
            function applyRecursively(obj) {
                if (!obj || typeof obj !== 'object') return

                for (const key in obj) {
                    const value = obj[key]
                    if (value && typeof value === 'object') {
                        const isTag = 'source' in value

                        // Apply based on mode and node type
                        if ((mode === 'all') || (!isTag && mode === 'groups')) {
                            mergeDeep(value, modifier)
                        }

                        // Continue recursion
                        applyRecursively(value)
                    }
                }
            }

            applyRecursively(source)
        }

        return
    }

    // Non-root path handling
    const {id, ref} = pathRef(source, path)
    if (!ref[id]) return

    // Apply to target node
    mergeDeep(ref[id], modifier)

    // Apply to nested nodes based on mode
    if (mode !== 'self') {
        function applyToChildren(obj) {
            if (!obj || typeof obj !== 'object') return

            for (const key in obj) {
                const value = obj[key]
                if (value && typeof value === 'object') {
                    const isTag = 'source' in value

                    // Apply based on mode and node type
                    if ((mode === 'all') || (!isTag && mode === 'groups')) {
                        mergeDeep(value, modifier)
                    }

                    // Continue recursion
                    applyToChildren(value)
                }
            }
        }

        applyToChildren(ref[id])
    }
}

export function pathUpdate(source, path, value) {
    const {id, ref} = pathRef(source, path)

    for (const key in ref[id]) {
        if (!(key in value)) {
            delete ref[id][key]
        }
    }

    // Update ref[id] with new values
    Object.assign(ref[id], value)

    logger.info(`update path: ${path}`)
}

/**
 * Moves a path in an object.
 * @param {*} source
 * @param {*} oldPath
 * @param {*} newPath
 */
export function pathMove(source, oldPath, newPath) {
    logger.info(`move path: ${oldPath} - ${newPath}`)
    const oldId = oldPath.at(-1)
    const oldRefPath = oldPath.slice(0, -1)

    const newId = newPath.at(-1)
    const newRefPath = newPath.slice(0, -1)

    const oldSourceRef = keyPath(source, oldRefPath)
    const newSourceRef = keyPath(source, newRefPath, true)

    newSourceRef[newId] = oldSourceRef[oldId]
    newSourceRef[newId]._id = newId
    delete oldSourceRef[oldId]
}

export function pathRef(source, path, create = false) {
    if (!path.length) {
        return {id: null, ref: source}
    }
    const id = path.at(-1)
    const refPath = path.slice(0, -1)
    return {
        id,
        path: refPath,
        ref: keyPath(source, refPath, create),
    }
}
