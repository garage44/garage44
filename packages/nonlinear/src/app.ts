import {App, store} from '@garage44/common/app'
import {h, render} from 'preact'
import {persistantState, volatileState} from './lib/state'
import type {NonlinearState} from './types'
import {Main} from '@/components/main/main'
import {type DeepSignal} from 'deepsignal'

const $s = store.state as unknown as DeepSignal<NonlinearState>

store.load(persistantState, volatileState)

const app = new App()

// No i18n for now
app.init(
    Main,
    render,
    h,
    {},
    {enableBunchy: process.env.NODE_ENV !== 'production'},
)

export {$s, app}
