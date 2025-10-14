import * as _i18n from './lib/i18n'
import {create$t} from './lib/i18n'
import {Api} from './lib/api'
import type {CommonState} from './types'
import {initializeBunchy} from '@garage44/bunchy/client'
import {EventEmitter} from 'eventemitter3'
import {Notifier} from './lib/notifier'
import {Store} from './lib/store'
import env from './lib/env'
import {logger} from './lib/logger'
import {WebSocketClient} from './lib/ws-client'
logger.setLevel('debug')


const notifier = new Notifier()
const store = new Store<CommonState>()
const i18n = _i18n
const $t = create$t(store)

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
            }
            catch (error) {
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