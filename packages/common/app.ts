import * as _i18n from '@/lib/i18n'
import Api from '@/lib/api'
import EventEmitter from 'eventemitter3'
import { Logger } from '@garage44/common/lib/logger.ts'
import Store from '@/lib/store'
import env from '@/lib/env'
export {notify} from '@/lib/notifier'

export const logger = new Logger()
logger.setLevel('debug')
export const store = new Store()
export const i18n = _i18n
export const $s = store.state
export {$t} from './lib/i18n'

export const api = new Api()
export const events = new EventEmitter()

export class App {

    async init(Main, renderFn, hFn, translations) {
        env($s.env)
        await i18n.init(translations)

        try {
            renderFn(hFn(Main, {}), document.body)
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error rendering Main component:', error)
        }
        events.emit('app:init')
    }
}

globalThis.$s = $s
