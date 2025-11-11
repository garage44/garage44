import {useEffect} from 'preact/hooks'
import {AvatarUpload} from '../../avatar-upload/avatar-upload'
import {FieldSelect, ThemeToggle} from '@/components'
import {logger, store} from '@/app'

export interface ProfileTabProps {
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

    const languages = store.state.language_ui?.options || []
    const languageSelection = store.state.language_ui?.$selection

    return (
        <section class="c-profile-tab">
            <div class="section">
                <h2 class="section-title">Profile</h2>
                <AvatarUpload state={store.state} userEndpoint={userEndpoint} />
            </div>

            <div class="section">
                <h2 class="section-title">Appearance</h2>
                <div class="theme-toggle">
                    <ThemeToggle />
                    <p class="help-text">Choose your preferred color scheme</p>
                </div>
            </div>

            {languageSelection && languages.length > 0 && (
                <div class="section">
                    <h2 class="section-title">Language</h2>
                    <FieldSelect
                        model={languageSelection}
                        help="Select your preferred language"
                        label="Interface Language"
                        options={languages}
                        onChange={(language) => {
                            if (store.state.language_ui) {
                                store.state.language_ui.selection = language
                                store.save()
                            }
                            logger.info(`Language changed to: ${language}`)
                        }}
                    />
                </div>
            )}
        </section>
    )
}
