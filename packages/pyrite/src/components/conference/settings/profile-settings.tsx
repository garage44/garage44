import {useEffect, useState} from 'preact/hooks'
import {Icon} from '@garage44/common/components'
import {$s} from '@/app'
import {api, notifier, logger, store} from '@garage44/common/app'
import {$t} from '@garage44/common/app'
import AvatarUpload from './avatar-upload'
import {FieldSelect, ThemeToggle} from '@garage44/common/components'
import './profile-settings.css'

/**
 * Simple Profile Settings Page
 * Contains avatar upload, theme toggle, and language selection
 */
export default function ProfileSettings() {
    // Use language options from global state (same as i18n)
    const languages = $s.language_ui.options || []

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

    const saveSettings = async () => {
        store.save()
        notifier.notify({
            level: 'success',
            message: 'Settings saved',
        })
    }

    return (
        <div class="c-profile-settings content view">
            <header class="settings-header">
                <div class="notice" />
                <div class="title">
                    <span>Settings</span>
                    <Icon class="item-icon icon-regular" name="settings" />
                </div>
            </header>

            <div class="settings-content">
                <section class="settings-section">
                    <h2 class="section-title">Profile</h2>
                    <AvatarUpload />
                </section>

                <section class="settings-section">
                    <h2 class="section-title">Appearance</h2>
                    <div class="theme-toggle-wrapper">
                        <label>Theme</label>
                        <ThemeToggle />
                        <p class="help-text">Choose your preferred color scheme</p>
                    </div>
                </section>

                <section class="settings-section">
                    <h2 class="section-title">Language</h2>
                    <FieldSelect
                        model={$s.language_ui.$selection}
                        help="Select your preferred language"
                        label="Interface Language"
                        options={languages}
                        onChange={() => {
                            // Language change is handled automatically by i18n.ts effect
                            // which watches store.state.language_ui.selection
                            // and calls i18next.changeLanguage()
                            logger.info(`Language changed to: ${$s.language_ui.selection}`)
                            store.save()
                        }}
                    />
                </section>

                <div class="settings-actions">
                    <button class="btn btn-primary" onClick={saveSettings}>
                        <Icon name="save" type="info" />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    )
}
