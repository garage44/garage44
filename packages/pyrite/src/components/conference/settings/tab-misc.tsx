import {FieldSelect} from '@garage44/common/components'
import {useEffect} from 'preact/hooks'
import {$s} from '@/app'
import {$t} from '@garage44/common/app'
import {logger} from '@garage44/common/app'

export default function TabMisc() {
    const languages = [
        {id: 'de', name: 'ui.settings.misc.language.german_label'},
        {id: 'en', name: 'ui.settings.misc.language.english_label'},
        {id: 'fr', name: 'ui.settings.misc.language.french_label'},
        {id: 'nl', name: 'ui.settings.misc.language.dutch_label'},
    ]

    const themes = [
        {id: 'system', name: 'ui.settings.misc.theme.system_label'},
        {id: 'light', name: 'ui.settings.misc.theme.light_label'},
        {id: 'dark', name: 'ui.settings.misc.theme.dark_label'},
    ]

    // Watch for theme changes
    useEffect(() => {
        const themeColor = getComputedStyle(document.querySelector('.app')!).getPropertyValue('--grey-4')
        logger.info(`setting theme color to ${themeColor}`)
        const metaTheme = document.querySelector('meta[name="theme-color"]')
        if (metaTheme) {
            (metaTheme as HTMLMetaElement).content = themeColor
        }
    }, [$s.theme])

    return (
        <section class="tab-content active">
            <FieldSelect
                value={$s.theme}
                onChange={(value) => $s.theme = value}
                help={$t('ui.settings.misc.theme_help')}
                label={$t('ui.settings.misc.theme_label')}
                name="language"
                options={themes}
            />

            <FieldSelect
                value={$s.language}
                onChange={(value) => $s.language = value}
                help={$t('ui.settings.misc.language_help')}
                label={$t('ui.settings.misc.language_label')}
                name="language"
                options={languages}
            />
        </section>
    )
}
