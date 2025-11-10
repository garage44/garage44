import {
    App,
    store,
} from '@garage44/common/app'
import {h, render} from 'preact'
import {persistantState, volatileState} from './lib/state'
import {Main} from '@/components/main'
import type {StyleguideState} from './types'
import {type DeepSignal} from 'deepsignal'

const $s = store.state  as unknown as DeepSignal<StyleguideState>

store.load(persistantState, volatileState)

const app = new App()

// Simple mock translations for the styleguide
const mockTranslations = {
    'direction_helper': 'ltr',
    'nav.components': 'Components',
    'nav.forms': 'Forms',
    'nav.tokens': 'Design Tokens',
    'styleguide.components': 'Components',
    'styleguide.forms': 'Forms',
    'styleguide.title': 'Garage44 Common Styleguide',
    'styleguide.tokens': 'Design Tokens',
}

app.init(Main, render, h, mockTranslations, {enableBunchy: process.env.NODE_ENV !== 'production'})

export {$s, app}