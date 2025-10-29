import {App, store} from '@garage44/common/app'
import {h, render} from 'preact'
import {persistantState, volatileState} from './lib/state'
import type {PyriteState} from './types'
import {Main} from './components/main/main'
import {i18nFormat} from '@garage44/common/lib/i18n'
import {initWebSocketSubscriptions} from '@/lib/ws-subscriptions'
import {type DeepSignal} from 'deepsignal'
import workspace from '@/.expressio.json'
const $s = store.state as unknown as DeepSignal<PyriteState>

store.load(persistantState, volatileState)

// Initialize WebSocket subscriptions
initWebSocketSubscriptions()

const app = new App()


app.init(Main, render, h, i18nFormat(workspace.i18n, workspace.config.languages.target), {bunchyPrefix: 'E'})

export {$s, app, store}
