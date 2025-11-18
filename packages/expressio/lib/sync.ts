import {enola} from '../service.ts'
import {keyMod} from '@garage44/common/lib/utils.ts'
import {pathRef} from '@garage44/common/lib/paths.ts'

/**
 * Synchronizes translations for a specific language.
 *
 * This function iterates through the i18n settings, performing actions based on the 'action' parameter:
 * - For 'remove': It removes the translation for the specified language.
 * - For 'update': It adds new translations or uses placeholders for tags.
 *
 * After processing, it translates any new content that needs translation.
 *
 * @param {Object} language - The language object to sync.
 * @param {string} action - The action to perform ('remove' or 'update').
 * @returns {Promise<Object>} An object containing arrays of added and removed translations.
 */
export async function syncLanguage(workspace, language, action) {
    const syncTags = []

    keyMod(workspace.i18n, (_srcRef, _id, refPath) => {
        const {id, ref} = pathRef(workspace.i18n, refPath)
        if (typeof ref[id] === 'object' && 'target' in ref[id]) {
            if (action === 'remove') {if (language.id in ref[id].target) {
delete ref[id].target[language.id]
}} else if (action === 'update') {
                // These are still placeholders; no need to translate these.
                if (ref[id].source.startsWith('tag')) {
ref[id].target[language.id] = ref[id].source
} else {
syncTags.push([ref[id], ref[id].source])
}
            }

        }
    })

    if (syncTags.length) {
        const translations = await enola.translateBatch(language.engine, syncTags, language)
        for (const [tag, translation] of translations) {
tag.target[language.id] = translation
}
    }

    return syncTags
}
