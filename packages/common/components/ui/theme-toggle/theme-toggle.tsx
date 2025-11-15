import {Icon} from '../icon/icon'
import {store} from '@/app'

const themes = ['light', 'dark', 'system'] as const

const cycleTheme = () => {
    const currentIndex = themes.indexOf(store.state.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    store.state.theme = themes[nextIndex]
}

export const ThemeToggle = () => (
    <div class="c-theme-toggle">
        <Icon
            name={(() => {
                if (store.state.theme === 'light') return 'sun'
                if (store.state.theme === 'dark') return 'moon'
                return 'system' // system preference icon
            })()}
            onClick={cycleTheme}
            size="s"
            tip={`Theme: ${store.state.theme}`}
        />
    </div>
)
