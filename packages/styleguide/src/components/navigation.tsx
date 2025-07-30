import {h} from 'preact'
import {route} from 'preact-router'
import {$s} from '../app'

export const Navigation = () => (
    <nav class="styleguide__nav">
        <h1 class="styleguide__title">Garage44 Common</h1>
        <ul class="styleguide__nav-list">
            <li>
                <button
                    class={`styleguide__nav-link ${$s.currentRoute === '/components' ? 'active' : ''}`}
                    onClick={() => {
                        $s.currentRoute = '/components'
                        route('/components')
                    }}
                >
                    Components
                </button>
            </li>
            <li>
                <button
                    class={`styleguide__nav-link ${$s.currentRoute === '/tokens' ? 'active' : ''}`}
                    onClick={() => {
                        $s.currentRoute = '/tokens'
                        route('/tokens')
                    }}
                >
                    Design Tokens
                </button>
            </li>
        </ul>
    </nav>
)