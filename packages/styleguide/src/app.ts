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
    'nav.components': 'Components',
    'nav.tokens': 'Design Tokens',
    'styleguide.components': 'Components',
    'styleguide.title': 'Garage44 Common Styleguide',
    'styleguide.tokens': 'Design Tokens',
}

app.init(Main, render, h, mockTranslations, {bunchyPrefix: 'S'})

export {$s, app}