import * as _i18n from './lib/i18n'
import {create$t, I18N_PATH_SYMBOL} from './lib/i18n'
import {Api} from './lib/api'
import type {CommonState} from './types'
import {initializeBunchy} from '@garage44/bunchy/client'
import {EventEmitter} from 'node:events'
import {Notifier} from './lib/notifier'
import {Store} from './lib/store'
import env from './lib/env'
import {logger} from './lib/logger'
import {WebSocketClient} from './lib/ws-client'
import {keyMod, keyPath} from './lib/utils'
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

/**
 * Creates a typed i18n object from a workspace JSON structure.
 * Attaches path symbols to translation objects for type-safe $t() references.
 *
 * @param workspace - Workspace object with i18n property
 * @returns Typed i18n object with path symbols attached
 */
function createTypedI18n<T extends {i18n: Record<string, unknown>}>(workspace: T): T['i18n'] {
    // Create a shallow copy to avoid mutating the original
    const i18n = {...workspace.i18n}

    // Attach path symbols to translation objects
    keyMod(i18n, (_srcRef, _id, refPath) => {
        const sourceRef = keyPath(i18n, refPath)
        if (typeof sourceRef === 'object' && 'source' in sourceRef && refPath.length > 0) {
            const pathString = `i18n.${refPath.join('.')}`
            sourceRef[I18N_PATH_SYMBOL] = pathString
        }
    })

    return i18n
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
    createTypedI18n,
    events,
    logger,
    i18n,
    notifier,
    store,
    ws,
}