import {App, store} from '@garage44/common/app'
import {h, render} from 'preact'
import {persistantState, volatileState} from './lib/state'
import type {ExpressioState} from './types'
import {Main} from '@/components/main/main'
import {i18nFormat} from '@garage44/common/lib/i18n'
import workspace from '@/.expressio.json'
import {type DeepSignal} from 'deepsignal'

const $s = store.state as unknown as DeepSignal<ExpressioState>

store.load(persistantState, volatileState)

const app = new App()

app.init(Main, render, h, i18nFormat(workspace.i18n, workspace.config.languages.target), {bunchyPrefix: 'E'})

export {$s, app}