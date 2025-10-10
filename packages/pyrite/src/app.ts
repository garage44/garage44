import {
    api,
    App,
    $s as _$s,
    $t,
    store,
} from '@garage44/common/app'
import {h, render} from 'preact'
import {persistantState, volatileState} from './lib/state.ts'
import type {PyriteState} from './types.ts'
import {Main} from '@/components/main/main'
import {Notifier} from '@garage44/common/lib/notifier'
import {WebSocketClient} from '@garage44/common/lib/ws-client'
import {initWebSocketSubscriptions} from '@/lib/ws-subscriptions'

const ws = new WebSocketClient(`ws://${globalThis.location.hostname}:3030/ws`)
const $s = _$s as PyriteState

store.load(persistantState, volatileState)

const app = new App()
const notifier = new Notifier($s.notifications)

// Pluralization helper using i18next's count feature
const $tc = (key: string, count: number, context?: any) => {
    return $t(key, { count, ...context })
}

// Initialize app with translations loaded from API
async function initApp() {
    try {
        // Determine language
        let currentLanguage = 'en'
        if ($s.language.id) {
            currentLanguage = $s.language.id
        } else {
            const supportedLanguages = ['de', 'en', 'nl', 'fr']
            const browserLanguage = navigator.language.split('-')[0]
            if (supportedLanguages.includes(browserLanguage)) {
                currentLanguage = browserLanguage
            }
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

initApp()

export {
    $s,
    $t,
    $tc,
    api,
    app,
    notifier,
    store,
    ws,
}
