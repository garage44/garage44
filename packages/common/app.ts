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

const ws = new WebSocketClient(`ws://${globalThis?.location?.hostname}:3030/ws`)

interface InitOptions {
    bunchyPrefix?: string
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

        // Initialize Bunchy centrally when a prefix is provided (apps pass this in dev)
        if (options.bunchyPrefix) {
            try {
                initializeBunchy({logPrefix: options.bunchyPrefix})
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