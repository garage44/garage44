import {Button} from '../button/button'
import {store} from '@garage44/common/app'

/**
 * ThemeToggle - Reusable theme switcher component
 *
 * Cycles between light, dark, and system themes using the common store.
 * Theme preference is automatically persisted to localStorage.
 *
 * @example
 * <ThemeToggle />
 */
export const ThemeToggle = () => {
    const {theme} = store.state

    const cycleTheme = () => {
        const themes = ['light', 'dark', 'system'] as const
        const currentIndex = themes.indexOf(theme)
        const nextIndex = (currentIndex + 1) % themes.length
        store.state.theme = themes[nextIndex]
    }

    const getIcon = () => {
        if (theme === 'light') return 'sun'
        if (theme === 'dark') return 'moon'
        return 'monitor' // system preference icon
    }

    return (
        <Button
            icon={getIcon()}
            onClick={cycleTheme}
            variant="toggle"
            tip={`Theme: ${theme}`}
        />
    )
}
