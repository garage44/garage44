import {
    App,
    $s as _$s,
    store,
} from '@garage44/common/app'
import {h, render} from 'preact'
import {persistantState, volatileState} from './lib/state'
import {BunchyClient} from '@garage44/bunchy/client'
import type {ExpressioState} from './types'
import {Main} from '@/components/main/main'
import {WebSocketClient} from '@garage44/common/lib/ws-client'

import {i18nFormat} from '@garage44/common/lib/i18n.ts'
import workspace from '@/.expressio.json'

// Development client is injected here
process.env.NODE_ENV === 'development' && new BunchyClient()

const ws = new WebSocketClient(`ws://${globalThis.location.hostname}:3030/ws`)
const $s = _$s as ExpressioState

store.load(persistantState, volatileState)

const app = new App()

app.init(Main, render, h, i18nFormat(workspace.i18n, workspace.config.languages.target))

export {
    $s,
    app,
    ws,
}