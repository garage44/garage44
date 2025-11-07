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
                // Set user authentication/admin flags
                $s.profile.admin = result.admin || false
                $s.profile.authenticated = result.authenticated || false
                // Set profile data from result
                if (result.id) $s.profile.id = result.id
                if (result.username) $s.profile.username = result.username
                if (result.password) $s.profile.password = result.password
                if (result.profile) {
                    $s.profile.avatar = result.profile.avatar || 'placeholder-1.png'
                    $s.profile.displayName = result.profile.displayName || result.username || 'User'
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
