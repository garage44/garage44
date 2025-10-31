import {$s} from '@/app'
import {logger, store} from '@garage44/common/app'
import {ProfileSettings} from '@garage44/common/components'

/**
 * Profile Settings Page
 * Uses the common ProfileSettings component with Expressio-specific state
 */
export function Profile() {
    return (
        <ProfileSettings
            state={$s}
            onLanguageChange={(state, language) => {
                if (state?.language_ui) {
                    state.language_ui.selection = language
                }
                logger.info(`Language changed to: ${language}`)
                store.save()
            }}
        />
    )
}
