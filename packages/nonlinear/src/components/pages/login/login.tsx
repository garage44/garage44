import {api, notifier, ws} from '@garage44/common/app'
import {$s} from '@/app'
import {Button, FieldText} from '@garage44/common/components'
import {deepSignal} from 'deepsignal'
import {route} from 'preact-router'
import {useState} from 'preact/hooks'

const state = deepSignal({
    username: '',
    password: '',
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
                username: state.username,
                password: state.password,
            })

            if (result.authenticated) {
                $s.profile.authenticated = true
                $s.profile.username = result.username || state.username
                ws.connect()
                route('/board')
            } else {
                setError(result.error || 'Invalid credentials')
            }
        } catch (err) {
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
                        type='password'
                        required
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
