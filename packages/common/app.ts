// oxlint-disable-next-line no-namespace
import * as _i18n from '@/lib/i18n'
import {$t} from './lib/i18n'
import Api from '@/lib/api'
import env from '@/lib/env'
import {EventEmitter} from 'eventemitter3'
import {Logger} from '@garage44/common/lib/logger.ts'
import {Notifier} from '@/lib/notifier'
import {Store} from '@/lib/store'
import type {CommonState} from '@/types'

const logger = new Logger()
logger.setLevel('debug')

const store = new Store<CommonState>()
const i18n = _i18n
const $s = store.state

const notifier = new Notifier($s.notifications)
const api = new Api()
const events = new EventEmitter()

class App {

    async init(Main, renderFn, hFn, translations) {
        env($s.env)
        await i18n.init(translations)

        try {
            renderFn(hFn(Main, {}), document.body)
        } catch (error) {
            // oxlint-disable-next-line no-console
            console.error('Error rendering Main component:', error)
        }
        events.emit('app:init')
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
    notifier,
    store,
}