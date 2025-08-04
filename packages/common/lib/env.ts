import {$s} from '@garage44/common/app'
import {effect} from '@preact/signals'

export default function env(env) {
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
        if (!event.altKey) {env.altKey = false}
        if (!event.ctrlKey) {env.ctrlKey = false}
        if (!event.shiftKey) {env.shiftKey = false}
    })

        // Watch for theme changes and update HTML class
    let isFirstRun = true
    effect(() => {
        const theme = $s.theme

        // Skip the initial run, only react to actual changes
        if (isFirstRun) {
            isFirstRun = false
            return
        }

        const htmlElement = document.documentElement

        // Remove existing theme classes
        htmlElement.classList.remove('dark', 'light', 'system')

        // Add new theme class
        if (theme) {
            htmlElement.classList.add(theme)
        }
    })

    console.log('TEHEM', $s.theme)
}
