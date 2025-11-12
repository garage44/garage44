import {create$t, init as i18nInit} from './lib/i18n'
import {Api} from './lib/api'
import type {CommonState} from './types'
import {EventEmitter} from 'node:events'
import {Notifier} from './lib/notifier'
import {Store} from './lib/store'
import env from './lib/env'
import {logger} from './lib/logger'
import {WebSocketClient} from './lib/ws-client'
import {persistentState, volatileState} from './lib/state'
logger.setLevel('debug')

const notifier = new Notifier()
const store = new Store<CommonState>()
store.load(persistentState as unknown as CommonState, volatileState as Partial<CommonState>)
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

        // Store references for HMR re-rendering
        if (globalThis !== undefined) {
            ;(globalThis as any).__HMR_MAIN_COMPONENT__ = Main
            ;(globalThis as any).__HMR_RENDER_FN__ = renderFn
            ;(globalThis as any).__HMR_H_FN__ = hFn
        }

        try {
            renderFn(hFn(Main, {}), document.body)
        } catch (error) {
            // oxlint-disable-next-line no-console
            console.error('Error rendering Main component:', error)
        }
        events.emit('app:init')
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