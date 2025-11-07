import {$s} from '@/app'
import {logger, store} from '@garage44/common/app'
import {ProfileSettings as CommonProfileSettings} from '@garage44/common/components'

/**
 * Profile Settings Page
 * Uses the common ProfileSettings component with pyrite-specific state
 */
export default function ProfileSettings() {
    return (
        <CommonProfileSettings
            state={$s}
            onLanguageChange={(state, language) => {
                // Language change is handled automatically by i18n.ts effect
                // which watches store.state.language_ui.selection
                // and calls i18next.changeLanguage()
                logger.info(`Language changed to: ${language}`)
                store.save()
            }}
        />
    )
}
