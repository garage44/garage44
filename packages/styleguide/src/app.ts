import {
    App,
    $s as _$s,
    store,
} from '@garage44/common/app'
import {h, render} from 'preact'
import {persistantState, volatileState} from './lib/state'
import {BunchyClient} from '@garage44/bunchy/client'
import {Main} from '@/components/main'
import type {StyleguideState} from './types'
import {i18nFormat} from '@garage44/common/lib/i18n.ts'
// Development client is injected here
process.env.NODE_ENV === 'development' && new BunchyClient()

const $s = _$s as StyleguideState

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

app.init(Main, render, h, mockTranslations)

export {
    $s,
    app,
}