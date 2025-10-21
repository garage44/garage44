import {collectSource, pathRef} from '@garage44/common/lib/paths.ts'
import type {EnolaTag} from '@garage44/enola/types.ts'
import {enola} from '../service.ts'
import {hash} from '@garage44/common/lib/utils.ts'

const LANGUAGE_PROCESSING_DELAY = 100 // 1 second delay between languages

async function translate_tag(workspace, tagPath:string[], sourceText:string, persist = true) {
    const {id, ref} = pathRef(workspace.i18n, tagPath)

    ref[id].source = sourceText
    ref[id].cache = hash(sourceText)

    if (persist && ref[id]._soft) {
        delete ref[id]._soft
    }
    if (!ref[id].target) {
        ref[id].target = {}
    }

    const translations = []
    for (const language of workspace.config.languages.target) {
        try {
            if (!language.engine) {
                // This should be safeguarded by the UI, but just in case...
                throw new Error(`No engine found for language ${language.id}`)
            }
            const translation = await enola.translate(language.engine, ref[id], language)
            translations.push(translation)
            // Add delay between languages
            if (workspace.config.languages.target.indexOf(language) < workspace.config.languages.target.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, LANGUAGE_PROCESSING_DELAY))
            }
        } catch (error) {
            if (error.response?.status === 429) {
                const retryAfter = error.response.headers['retry-after'] || 60
                await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
                const retryTranslation = await enola.translate(language.engine, ref[id], language)
                translations.push(retryTranslation)
            } else {
                throw error
            }
        }
    }

    for (const [index, language] of workspace.config.languages.target.entries()) {
        ref[id].target[language.id] = translations[index]
    }

    // After translation is complete, broadcast the updated state
    workspace.broadcastI18nState()

    return {id, ref}
}

async function translate_path(workspace, tagPath:string[], ignore_cache) {
    const {cached, targets} = collectSource(workspace.i18n, tagPath, ignore_cache)
    const translations = []

    if (!targets.length) {
        return {cached, targets, translations}
    }

    // Add rate limiting and error handling for batch translation
    for (const language of workspace.config.languages.target) {
        try {
            const translation = await enola.translateBatch(language.engine, targets, language)
            translations.push(translation)
            // Add delay between languages
            if (workspace.config.languages.target.indexOf(language) < workspace.config.languages.target.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, LANGUAGE_PROCESSING_DELAY))
            }
        } catch (error) {
            if (error.response?.status === 429) {
                const retryAfter = error.response.headers['retry-after'] || 60
                await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
                const retryTranslation = await enola.translateBatch(language.engine, targets, language)
                translations.push(retryTranslation)
            } else {
                throw error
            }
        }
    }

    for (const [index, language] of workspace.config.languages.target.entries()) {
        const batchTranslations = translations[index]
        for (const [tag, translation] of batchTranslations) {
            const translationTag = tag as EnolaTag
            translationTag.cache = hash(translationTag.source)
            translationTag.target[language.id] = translation
        }
    }

    // After batch translation is complete, broadcast the updated state
    workspace.broadcastI18nState()

    return {cached, targets, translations}
}

export {
    translate_tag,
    translate_path,
}