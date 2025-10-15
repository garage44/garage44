import {Button} from '../button/button'
import {store} from '@garage44/common/app'

/**
 * ThemeToggle - Reusable theme switcher component
 *
 * Toggles between light and dark themes using the common store.
 * Theme preference is automatically persisted to localStorage.
 *
 * @example
 * <ThemeToggle />
 */
export const ThemeToggle = () => {
    const {theme} = store.state

    return (
        <Button
            icon={theme === 'dark' ? 'sun' : 'moon'}
            onClick={() => {
                store.state.theme = theme === 'dark' ? 'light' : 'dark'
            }}
            variant="toggle"
        />
    )
}
