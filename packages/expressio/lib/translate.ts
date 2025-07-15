import {collectSource, pathRef} from '@garage44/common/lib/paths.ts'
import type {EnolaTag} from '@garage44/enola/types.ts'
import {enola} from '../service.ts'
import {hash} from '@garage44/common/lib/utils.ts'

const LANGUAGE_PROCESSING_DELAY = 100 // 1 second delay between languages

export async function translate_tag(workspace, tagPath:string[], sourceText:string, persist = true) {
    const {id, ref} = pathRef(workspace.i18n, tagPath)

    ref[id].source = sourceText
    ref[id].cache = hash(sourceText)

    if (persist && ref[id]._soft) {
        delete ref[id]._soft
    }
    if (!ref[id].target) {
        ref[id].target = {}
    }

    const totalLanguages = workspace.config.languages.target.length
    const translations = []
    
    // Emit progress start event
    workspace.broadcastTranslationProgress({
        type: 'tag',
        path: tagPath,
        total: totalLanguages,
        processed: 0,
        status: 'started',
        message: 'Starting translation...'
    })

    for (const [index, language] of workspace.config.languages.target.entries()) {
        try {
            if (!language.engine) {
                // This should be safeguarded by the UI, but just in case...
                throw new Error(`No engine found for language ${language.id}`)
            }
            
            // Emit progress update
            workspace.broadcastTranslationProgress({
                type: 'tag',
                path: tagPath,
                total: totalLanguages,
                processed: index,
                status: 'processing',
                message: `Translating to ${language.id}...`,
                currentLanguage: language.id
            })

            const translation = await enola.translate(language.engine, ref[id], language)
            translations.push(translation)
            
            // Emit progress update after successful translation
            workspace.broadcastTranslationProgress({
                type: 'tag',
                path: tagPath,
                total: totalLanguages,
                processed: index + 1,
                status: 'processing',
                message: `Completed ${language.id} translation`,
                currentLanguage: language.id
            })
            
            // Add delay between languages
            if (index < totalLanguages - 1) {
                await new Promise(resolve => setTimeout(resolve, LANGUAGE_PROCESSING_DELAY))
            }
        } catch (error) {
            workspace.broadcastTranslationProgress({
                type: 'tag',
                path: tagPath,
                total: totalLanguages,
                processed: index,
                status: 'error',
                message: `Failed to translate to ${language.id}: ${error.message}`,
                currentLanguage: language.id
            })

            if (error.response?.status === 429) {
                const retryAfter = error.response.headers['retry-after'] || 60
                workspace.broadcastTranslationProgress({
                    type: 'tag',
                    path: tagPath,
                    total: totalLanguages,
                    processed: index,
                    status: 'retrying',
                    message: `Rate limited, retrying in ${retryAfter} seconds...`,
                    currentLanguage: language.id
                })
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
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

    // Emit completion event
    workspace.broadcastTranslationProgress({
        type: 'tag',
        path: tagPath,
        total: totalLanguages,
        processed: totalLanguages,
        status: 'completed',
        message: 'Translation completed successfully!'
    })

    // After translation is complete, broadcast the updated state
    workspace.broadcastI18nState()

    return {id, ref}
}

export async function translate_path(workspace, tagPath:string[], ignore_cache) {
    const {cached, targets} = collectSource(workspace.i18n, tagPath, ignore_cache)
    const translations = []

    if (!targets.length) {
        return {cached, targets, translations}
    }

    const totalLanguages = workspace.config.languages.target.length
    const totalTags = targets.length
    const totalOperations = totalLanguages * totalTags
    let processedOperations = 0

    // Emit progress start event
    workspace.broadcastTranslationProgress({
        type: 'batch',
        path: tagPath,
        total: totalOperations,
        processed: 0,
        status: 'started',
        message: `Starting batch translation of ${totalTags} items across ${totalLanguages} languages...`,
        batchInfo: {
            totalTags,
            totalLanguages,
            processedTags: 0,
            processedLanguages: 0
        }
    })

    // Add rate limiting and error handling for batch translation
    for (const [langIndex, language] of workspace.config.languages.target.entries()) {
        try {
            // Emit language start event
            workspace.broadcastTranslationProgress({
                type: 'batch',
                path: tagPath,
                total: totalOperations,
                processed: processedOperations,
                status: 'processing',
                message: `Translating ${totalTags} items to ${language.id}...`,
                currentLanguage: language.id,
                batchInfo: {
                    totalTags,
                    totalLanguages,
                    processedTags: totalTags,
                    processedLanguages: langIndex
                }
            })

            const translation = await enola.translateBatch(language.engine, targets, language)
            translations.push(translation)
            
            processedOperations += totalTags
            
            // Emit language completion event
            workspace.broadcastTranslationProgress({
                type: 'batch',
                path: tagPath,
                total: totalOperations,
                processed: processedOperations,
                status: 'processing',
                message: `Completed ${language.id} translations`,
                currentLanguage: language.id,
                batchInfo: {
                    totalTags,
                    totalLanguages,
                    processedTags: totalTags,
                    processedLanguages: langIndex + 1
                }
            })

            // Add delay between languages
            if (langIndex < totalLanguages - 1) {
                await new Promise(resolve => setTimeout(resolve, LANGUAGE_PROCESSING_DELAY))
            }
        } catch (error) {
            workspace.broadcastTranslationProgress({
                type: 'batch',
                path: tagPath,
                total: totalOperations,
                processed: processedOperations,
                status: 'error',
                message: `Failed to translate batch to ${language.id}: ${error.message}`,
                currentLanguage: language.id,
                batchInfo: {
                    totalTags,
                    totalLanguages,
                    processedTags: totalTags,
                    processedLanguages: langIndex
                }
            })

            if (error.response?.status === 429) {
                const retryAfter = error.response.headers['retry-after'] || 60
                workspace.broadcastTranslationProgress({
                    type: 'batch',
                    path: tagPath,
                    total: totalOperations,
                    processed: processedOperations,
                    status: 'retrying',
                    message: `Rate limited, retrying batch in ${retryAfter} seconds...`,
                    currentLanguage: language.id,
                    batchInfo: {
                        totalTags,
                        totalLanguages,
                        processedTags: totalTags,
                        processedLanguages: langIndex
                    }
                })
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
                const retryTranslation = await enola.translateBatch(language.engine, targets, language)
                translations.push(retryTranslation)
                processedOperations += totalTags
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

    // Emit completion event
    workspace.broadcastTranslationProgress({
        type: 'batch',
        path: tagPath,
        total: totalOperations,
        processed: totalOperations,
        status: 'completed',
        message: `Batch translation completed successfully! Translated ${totalTags} items across ${totalLanguages} languages.`,
        batchInfo: {
            totalTags,
            totalLanguages,
            processedTags: totalTags,
            processedLanguages: totalLanguages
        }
    })

    // After batch translation is complete, broadcast the updated state
    workspace.broadcastI18nState()

    return {cached, targets, translations}
}
