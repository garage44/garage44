import {Components} from './pages/components'
import {Forms} from './pages/forms'
import {Navigation} from './navigation'
import {Router} from 'preact-router'
import {Tokens} from './pages/tokens'

export const Main = () => (
    <div class="styleguide">
        <Navigation />
        <main class="content">
            <Router>
                <Components path="/components" />
                <Components path="/" default />
                <Forms path="/forms" />
                <Tokens path="/tokens" />
            </Router>
        </main>
    </div>
)