import {$s} from '../../app'
import classnames from 'classnames'
import {api, ws, notifier} from '@garage44/common/app'
import {Router} from 'preact-router'
import {mergeDeep} from '@garage44/common/lib/utils'
import {ConferenceApp} from '../conference/app'
import {AdminApp} from '../admin/app'
import {Login, Notifications} from '@garage44/common/components'
import {useEffect} from 'preact/hooks'

export const Main = () => {
    useEffect(() => {
        (async () => {
            const context = await api.get('/api/context')
            mergeDeep($s.admin, context)

            if (context.authenticated) {
                ws.connect()
            }

            // Load emoji list
            if (!$s.chat.emoji?.list?.length) {
                const emojiData = await api.get('/api/chat/emoji')
                $s.chat.emoji.list = JSON.parse(emojiData)
            }
        })()
    }, [])

    const handleLogin = async (username: string, password: string): Promise<string | null> => {
        try {
            const context = await api.post('/api/login', {
                password,
                username,
            })

            Object.assign($s.admin, context)

            // Store credentials for Galene group reuse
            $s.user.username = username
            $s.user.password = password

            if (!context.authenticated || (context.authenticated && !context.permission)) {
                if (!context.authenticated) {
                    return 'Invalid credentials'
                } else if (context.authenticated && !context.permission) {
                    return 'No permission'
                }
            } else {
                notifier.notify({ level: 'info', message: 'Login successful' })
                ws.connect()
                return null // Success
            }
        } catch (err) {
            return 'Login failed. Please try again.'
        }
    }

    if ($s.admin.authenticated === null) {
        return null
    }

    if (!$s.admin.authenticated) {
        return <Login title="Pyrite" animated={true} onLogin={handleLogin} />
    }

    return <div class="app">
        <Router>
            {/* Admin routes */}
            <AdminApp path="/admin/*" />

            {/* Conference routes (default) */}
            <ConferenceApp default path="/*" />
        </Router>
        <Notifications notifications={$s.notifications}/>
    </div>
}
// test comment
