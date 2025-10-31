import {$s} from '@/app'
import {$t, api, logger, notifier, ws} from '@garage44/common/app'
import {Login as CommonLogin} from '@garage44/common/components'
import {mergeDeep} from '@garage44/common/lib/utils'

export const Login = () => {
    const handleLogin = async (username: string, password: string): Promise<string | null> => {
        try {
            const result = await api.post('/api/login', {
                password,
                username,
            })

            if (result.authenticated) {
                notifier.notify({
                    icon: 'check_circle',
                    link: {text: '', url: ''},
                    list: [],
                    message: $t('notifications.logged_in'),
                    type: 'info',
                })
                const config = await api.get('/api/config')
                // result from login already includes full profile from /api/context
                // Explicitly set user data from result to override any stale localStorage data
                const userState = $s.user as any
                userState.admin = result.admin || false
                userState.authenticated = result.authenticated || false
                if (result.id) userState.id = result.id
                if (result.username) userState.username = result.username
                if (result.profile) {
                    if (!userState.profile) userState.profile = {}
                    userState.profile.avatar = result.profile.avatar || 'placeholder-1.png'
                    userState.profile.displayName = result.profile.displayName || result.username || 'User'
                }
                mergeDeep($s, {
                    enola: config.enola,
                    workspaces: config.workspaces,
                }, {usage: {loading: false}})

                ws.connect()
                return null // Success - no error message
            }

            notifier.notify({
                icon: 'warning',
                link: {text: '', url: ''},
                list: [],
                message: $t('notifications.logged_in_fail'),
                type: 'warning',
            })
            return $t('notifications.logged_in_fail')
        } catch (_error) {
            notifier.notify({
                icon: 'warning',
                link: {text: '', url: ''},
                list: [],
                message: $t('notifications.logged_in_fail'),
                type: 'warning',
            })
            return $t('notifications.logged_in_fail')
        }
    }

    return <CommonLogin
        logo="/public/img/logo.svg"
        title="Expressio"
        animated={true}
        onLogin={handleLogin}
    />
}
