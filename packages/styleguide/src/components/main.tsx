import {Components} from './pages/components'
import {Navigation} from './navigation'
import {Router} from 'preact-router'
import {Tokens} from './pages/tokens'

export const Main = () => (
    <div class="styleguide">
        <Navigation />
        <main class="styleguide__content">
            <Router>
                <Components path="/components" />
                <Components path="/" default />
                <Tokens path="/tokens" />
            </Router>
        </main>
    </div>
)