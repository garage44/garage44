import {effect} from '@preact/signals'
import {store} from '../app'

// Apply theme based on preference (light/dark/system)
const applyTheme = (themePreference: 'light' | 'dark' | 'system') => {
    const htmlElement = document.documentElement
    htmlElement.classList.remove('dark', 'light')

    if (themePreference === 'system') {
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        htmlElement.classList.add(prefersDark ? 'dark' : 'light')
    } else {
        htmlElement.classList.add(themePreference)
    }
}

export default function env(env, _storeParam = null) {
    env.ua = navigator.userAgent.toLowerCase()

    if (globalThis.navigator) {
        env.isBrowser = true

        if (env.ua.includes('safari') && !env.ua.includes('chrome')) {
            env.isSafari = true
            env.browserName = 'Safari'
        }
        if (env.ua.includes('firefox')) {
            env.isFirefox = env.ua.includes('firefox')
            env.browserName = 'Firefox'
        }
    }

    const mediaQuery = globalThis.matchMedia('(max-width: 768px)')
    env.layout = mediaQuery.matches ? 'tablet' : 'desktop'
    mediaQuery.addListener((event) => {
        env.layout = event.matches ? 'tablet' : 'desktop'
    })

    // Initialize URL from current location and listen to browser navigation
    if (typeof window !== 'undefined') {
        env.url = window.location.pathname

        // Listen to browser back/forward navigation
        window.addEventListener('popstate', () => {
            if (store && store.state) {
                store.state.env.url = window.location.pathname
            }
        })
    }

    document.addEventListener('keydown', (event) => {
        if (event.altKey) {
            env.altKey = true
        }
        if (event.ctrlKey) {
            env.ctrlKey = true
        }
        if (event.shiftKey) {
            env.shiftKey = true
        }
    })
    document.addEventListener('keyup', (event) => {
        if (!event.altKey) {
            env.altKey = false
        }
        if (!event.ctrlKey) {
            env.ctrlKey = false
        }
        if (!event.shiftKey) {
            env.shiftKey = false
        }
    })

    if (store && store.state) {
        // Watch system preference changes
        const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
        systemThemeQuery.addEventListener('change', () => {
            if (store.state.theme === 'system') {
                applyTheme('system')
            }
        })

        // Apply initial theme
        applyTheme(store.state.theme)

        // Watch for theme changes and update HTML class
        effect(() => {
            const theme = store.state.theme
            applyTheme(theme)
        })
    }
}
