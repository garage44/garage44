// oxlint-disable-next-line no-namespace
import * as _i18n from '@/lib/i18n'
import {$t} from './lib/i18n'
import Api from '@/lib/api'
import {initializeBunchy} from '@garage44/bunchy/client'
import type {CommonState} from '@/types'
import {EventEmitter} from 'eventemitter3'
import {logger} from '@garage44/common/lib/logger.ts'
import {Store} from '@/lib/store'
import env from '@/lib/env'

// Logger level defaults per environment; avoid setting here to prevent init cycles in browser

const store = new Store<CommonState>()
const i18n = _i18n
const $s = store.state

const api = new Api()
const events = new EventEmitter()

interface InitOptions {
    bunchyPrefix?: string
}

class App {

    async init(Main, renderFn, hFn, translations, options: InitOptions = {}) {
        env($s.env)
        await i18n.init(translations)

        try {
            renderFn(hFn(Main, {}), document.body)
        } catch (error) {
            // oxlint-disable-next-line no-console
            console.error('Error rendering Main component:', error)
        }
        events.emit('app:init')

        // Initialize Bunchy centrally when a prefix is provided (apps pass this in dev)
        if (options.bunchyPrefix) {
            try { initializeBunchy({logPrefix: options.bunchyPrefix}) }
            catch (error) { console.warn('[App] Failed to initialize Bunchy:', error) }
        }
    }
}

globalThis.$s = $s

export {
    $s,
    $t,
    api,
    App,
    events,
    logger,
    i18n,
    store,
}