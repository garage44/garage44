import {api, ws} from '@garage44/common/app'
import {$s} from '@/app'
import {Button, FieldText} from '@garage44/common/components'
import {deepSignal} from 'deepsignal'
import {route} from 'preact-router'
import {useState} from 'preact/hooks'

const state = deepSignal({
    password: '',
    username: '',
})

export const Login = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async(e: Event) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const result = await api.post('/api/login', {
                password: state.password,
                username: state.username,
            })

            /*
             * Check if user was authenticated - the response should have authenticated: true
             * Also check if we have user data (id, username) as an alternative indicator
             * This handles cases where authenticated might not be set but user data is present
             */
            const isAuthenticated = result.authenticated || (result.id && result.username)

            if (isAuthenticated) {
                // Set profile data from result
                $s.profile.authenticated = true
                $s.profile.admin = result.admin || false
                if (result.id) $s.profile.id = result.id
                if (result.username) $s.profile.username = result.username
                if (result.profile) {
                    $s.profile.avatar = result.profile.avatar || 'placeholder-1.png'
                    $s.profile.displayName = result.profile.displayName || result.username || 'User'
                }

                ws.connect()
                route('/board')
            } else {
                setError(result.error || 'Invalid credentials')
            }
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div class='c-login'>
            <div class='c-login__card'>
                <h1>Nonlinear</h1>
                <p>AI-Powered Automated Project Management</p>
                <form onSubmit={handleSubmit}>
                    <FieldText
                        label='Username'
                        model={state.$username}
                        placeholder='Enter username'
                        required
                    />
                    <FieldText
                        label='Password'
                        model={state.$password}
                        placeholder='Enter password'
                        required
                        type='password'
                    />
                    {error && <div class='c-login__error'>{error}</div>}
                    <Button disabled={loading} type='submit'>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
