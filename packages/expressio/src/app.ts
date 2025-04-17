import {
    App,
    $s as _$s,
    store,
} from '@garage44/common/app'
import {
    ExpressioState,
    persistantState,
    volatileState,
} from './lib/state'
import {h, render} from 'preact'
import {BunchyClient} from '@garage44/bunchy/client'
import {Main} from '@/components/main/main'
import {WebSocketClient} from '@garage44/common/lib/ws-client'

import {i18nFormat} from '@garage44/common/lib/i18n.ts'
import workspace from '@/.expressio.json'

// Development client is injected here
process.env.NODE_ENV === 'development' && new BunchyClient()

export const ws = new WebSocketClient(`ws://${window.location.hostname}:3030/ws`)
export const $s = _$s as ExpressioState

store.load(persistantState, volatileState)

export const app = new App()

app.init(Main, render, h, i18nFormat(workspace.i18n, workspace.config.languages.target))
