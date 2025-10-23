import {logger} from './logger'
// This is a workaround to avoid i18next import errors on succesive builds.
import i18next from '@/lib/i18next'
import {copyObject, keyMod, keyPath} from './utils'
import {effect} from '@preact/signals'

function i18nFormat(i18n, targetLanguages) {
    const _i18n = copyObject(i18n)
    const i18nextFormatted = {}
    for (const language of targetLanguages) {
        i18nextFormatted[language.id] = {translation: {}}
    }

    keyMod(_i18n, (_srcRef, _id, refPath) => {
        const _i18nObject = keyPath(_i18n, refPath)

        if (typeof _i18nObject === 'object' && 'target' in _i18nObject) {
            for (const [language_id] of Object.entries(_i18nObject.target)) {
                if (!i18nextFormatted[language_id]) {
                    i18nextFormatted[language_id] = {translation: {}}
                }
                const _18nextObject = keyPath(i18nextFormatted[language_id].translation, refPath.slice(0, -1), true)
                _18nextObject[refPath.at(-1)] = _i18nObject.target[language_id]
            }
        }
    })

    return i18nextFormatted
}


async function init(translations = null, api = null, store = null) {
    let resources = null

    if (translations) {
        resources = translations
        logger.debug(`loading languages from bundle: ${Object.keys(resources).join(', ')}`)
    } else if (api) {
        resources = await api.get('/api/translations')
        logger.debug(`loading languages from endpoint: ${Object.keys(resources).join(', ')}`)
    }

    if (store && resources) {
        for (const language_id of Object.keys(resources)) {
            store.state.language_ui.i18n[language_id] = {}
        }
    }

    i18next.init({
        debug: process.env.NODE_ENV !== 'production',

        fallbackLng: 'eng-gbr',
        interpolation: {

            escapeValue: false,
        },
        lng: store?.state.language_ui.selection || 'eng-gbr',
        resources,
    })

    if (store) {
        effect(() => {
            const language = store.state.language_ui.selection
            i18next.changeLanguage(language)
            logger.debug(`language changed to: ${language}`)
            store.save()
        })
    }
}

/**
 * Creates a translation function with store-based caching
 * This is exported as a factory to avoid circular dependencies
 */
function create$t(store) {
    return (key: string, context = null): string => {
        if (!store.state.language_ui.i18n[store.state.language_ui.selection]) {
            store.state.language_ui.i18n[store.state.language_ui.selection] = {}
        }

        // Create a cache key that includes both the key and context
        const cacheKey = context ? `${key}:${JSON.stringify(context)}` : key

        if (!store.state.language_ui.i18n[store.state.language_ui.selection][cacheKey]) {
            store.state.language_ui.i18n[store.state.language_ui.selection][cacheKey] = i18next.t(key, context) as string
        }
        return store.state.language_ui.i18n[store.state.language_ui.selection][cacheKey]
    }
}

export {
    create$t,
    i18nFormat,
    init,
}