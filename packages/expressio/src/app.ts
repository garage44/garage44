import {
    App,
    $s as _$s,
    store,
} from '@garage44/common/app'
import {h, render} from 'preact'
import {persistantState, volatileState} from './lib/state'
import type {ExpressioState} from './types'
import {Main} from '@/components/main/main'
import {Notifier} from '@garage44/common/lib/notifier'
import {WebSocketClient} from '@garage44/common/lib/ws-client'
import {i18nFormat} from '@garage44/common/lib/i18n.ts'
import {initializeBunchy} from '@garage44/bunchy/client'
import workspace from '@/.expressio.json'

// Development client is injected here
if (process.env.NODE_ENV === 'development') {
    const bunchyClient = initializeBunchy({logPrefix: 'E'})
}

const ws = new WebSocketClient(`ws://${globalThis.location.hostname}:3030/ws`)
const $s = _$s as ExpressioState

store.load(persistantState, volatileState)

const app = new App()
const notifier = new Notifier($s.notifications)

app.init(Main, render, h, i18nFormat(workspace.i18n, workspace.config.languages.target))

export {
    $s,
    app,
    notifier,
    ws,
}