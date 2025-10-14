import {App, store} from '@garage44/common/app'
import {h, render} from 'preact'
import {persistantState, volatileState} from './lib/state'
import type {PyriteState} from './types'
import {Main} from './components/main/main'
import {initWebSocketSubscriptions} from '@/lib/ws-subscriptions'
import {type DeepSignal} from 'deepsignal'

const $s = store.state as unknown as DeepSignal<PyriteState>

store.load(persistantState, volatileState)

const app = new App()


// Initialize app with translations loaded from API
async function initApp() {
    try {
        // Determine language - use language_ui.selection
        let currentLanguage = 'en'
        if (store.state.language_ui.selection) {
            currentLanguage = store.state.language_ui.selection
        } else {
            const supportedLanguages = ['de', 'en', 'nl', 'fr']
            const browserLanguage = navigator.language.split('-')[0]
            if (supportedLanguages.includes(browserLanguage)) {
                currentLanguage = browserLanguage
            }
            store.state.language_ui.selection = currentLanguage
        }

        // Fetch translations
        const response = await fetch(`/api/i18n/${currentLanguage}`)
        const translations = await response.json()

        // Initialize WebSocket subscriptions
        initWebSocketSubscriptions()

        // Initialize the app
        app.init(Main, render, h, translations, {bunchyPrefix: 'P'})
    } catch (error) {
        // oxlint-disable-next-line no-console
        console.error('Failed to initialize Pyrite app:', error)
    }
}

await initApp()

export {$s, app, store}
