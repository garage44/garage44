import {useEffect} from 'preact/hooks'
import {AvatarUpload} from '../../avatar-upload/avatar-upload'
import {FieldSelect, ThemeToggle} from '@garage44/common/components'
import {logger, store} from '@garage44/common/app'
import './profile.css'

export interface ProfileTabProps {
    /**
     * Function to get language options from state
     * @default (state) => state?.language_ui?.options || []
     */
    getLanguageOptions?: (state: any) => any[]
    /**
     * Function to get language selection from state
     * @default (state) => state?.language_ui?.$selection
     */
    getLanguageSelection?: (state: any) => any | null
    /**
     * Function to handle language change
     * @default (state, language) => { state.language_ui.selection = language; store.save() }
     */
    onLanguageChange?: (state: any, language: string) => void
    /**
     * Global state object (typically $s from app)
     */
    state?: any
    /**
     * User endpoint for avatar upload
     * @default '/api/users/me'
     */
    userEndpoint?: string
}

/**
 * Profile Settings Tab Component
 * Contains avatar upload, theme toggle, and language selection
 */
export function Profile({
    getLanguageOptions = (s) => s?.language_ui?.options || [],
    getLanguageSelection = (s) => {
        // Try to get the signal - check if $selection exists
        if (s?.language_ui?.$selection && typeof s.language_ui.$selection === 'object' && 'value' in s.language_ui.$selection) {
            return s.language_ui.$selection
        }
        // Fallback: return null if signal doesn't exist
        return null
    },
    onLanguageChange = (s, language) => {
        if (s?.language_ui) {
            s.language_ui.selection = language
        }
        store.save()
    },
    state = null,
    userEndpoint = '/api/users/me',
}: ProfileTabProps = {}) {
    // Watch for theme changes
    useEffect(() => {
        const currentTheme = store.state.theme
        const themeColor = getComputedStyle(document.querySelector('.app')!).getPropertyValue('--surface-3')
        logger.info(`setting theme color to ${themeColor} for theme ${currentTheme}`)
        const metaTheme = document.querySelector('meta[name="theme-color"]')
        if (metaTheme) {
            (metaTheme as HTMLMetaElement).content = themeColor
        }
    }, [])

    const languages = state ? getLanguageOptions(state) : []
    const languageSelection = state ? getLanguageSelection(state) : null

    // Check if languageSelection is a valid signal (has .value property)
    const hasValidLanguageSelection = languageSelection && typeof languageSelection === 'object' && 'value' in languageSelection

    return (
        <section class="c-profile-tab">
            <div class="section">
                <h2 class="section-title">Profile</h2>
                <AvatarUpload state={state} userEndpoint={userEndpoint} />
            </div>

            <div class="section">
                <h2 class="section-title">Appearance</h2>
                <div class="theme-toggle">
                    <ThemeToggle />
                    <p class="help-text">Choose your preferred color scheme</p>
                </div>
            </div>

            {hasValidLanguageSelection && languages.length > 0 && (
                <div class="section">
                    <h2 class="section-title">Language</h2>
                    <FieldSelect
                        model={languageSelection}
                        help="Select your preferred language"
                        label="Interface Language"
                        options={languages}
                        onChange={(language) => {
                            if (state) {
                                onLanguageChange(state, language)
                            }
                            logger.info(`Language changed to: ${language}`)
                        }}
                    />
                </div>
            )}
        </section>
    )
}
