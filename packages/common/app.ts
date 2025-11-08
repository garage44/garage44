import {create$t, init as i18nInit} from '@garage44/expressio/lib/i18n'
import {volatileState as expressioVolatileState} from '@garage44/expressio/src/lib/state'
import {Api} from './lib/api'
import type {CommonState} from './types'
import {initializeBunchy} from '@garage44/bunchy/client'
import {EventEmitter} from 'node:events'
import {Notifier} from './lib/notifier'
import {Store} from './lib/store'
import env from './lib/env'
import {logger} from './lib/logger'
import {WebSocketClient} from './lib/ws-client'
import {mergeDeep} from './lib/utils'
import {persistentState, volatileState} from './lib/state'
logger.setLevel('debug')

const notifier = new Notifier()
const store = new Store<CommonState>()
// Merge language_ui from Expressio's volatileState into common's volatileState
const mergedVolatileState = mergeDeep({}, volatileState, {language_ui: expressioVolatileState.language_ui})
store.load(persistentState as unknown as CommonState, mergedVolatileState as Partial<CommonState>)
const $t = create$t(store)

// Create i18n object with init function
const i18n = {
    init: i18nInit,
}

const api = new Api()
const events = new EventEmitter()

// Helper function to construct WebSocket URL based on current protocol
function getWebSocketUrl(path: string): string {
    const protocol = globalThis?.location?.protocol === 'https:' ? 'wss:' : 'ws:'
    const hostname = globalThis?.location?.hostname || 'localhost'
    const port = (globalThis as any)?.location?.port
    // Only include port if it's explicitly set and not the default (80 for HTTP, 443 for HTTPS)
    // When behind Nginx with SSL, the port will be empty (defaults to 443) and Nginx will proxy to backend
    const portSuffix = port && port !== '80' && port !== '443' ? `:${port}` : ''
    return `${protocol}//${hostname}${portSuffix}${path}`
}

const ws = new WebSocketClient(getWebSocketUrl('/ws'))

interface InitOptions {
    enableBunchy?: boolean
}


class App {

    async init(Main, renderFn, hFn, translations, options: InitOptions = {}) {
        env(store.state.env, store)
        await i18n.init(translations, api, store)
        notifier.init(store.state.notifications)

        try {
            renderFn(hFn(Main, {}), document.body)
        } catch (error) {
            // oxlint-disable-next-line no-console
            console.error('Error rendering Main component:', error)
        }
        events.emit('app:init')

        // Initialize Bunchy when enabled
        if (options.enableBunchy) {
            console.log('[App] Initializing Bunchy')
            try {
                initializeBunchy()
            } catch (error) {
                // Silently fail if bunchy is not available
                console.warn('[App] Bunchy not available for development features:', error.message)
            }
        }
    }
}

export {
    $t,
    api,
    App,
    events,
    logger,
    i18n,
    notifier,
    store,
    ws,
}