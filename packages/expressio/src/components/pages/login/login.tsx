import {$s} from '@/app'
import {$t, api, notifier, ws} from '@garage44/common/app'
import {Login as CommonLogin, Notifications} from '@garage44/common/components'
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
                } as any)
                const config = await api.get('/api/config')
                mergeDeep($s, {
                    enola: config.enola,
                    user: result,
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
            } as any)
            return $t('notifications.logged_in_fail')
        } catch (error) {
            notifier.notify({
                icon: 'warning',
                link: {text: '', url: ''},
                list: [],
                message: $t('notifications.logged_in_fail'),
                type: 'warning',
            } as any)
            return $t('notifications.logged_in_fail')
        }
    }

    return <CommonLogin
        title="Expressio"
        animated={true}
        onLogin={handleLogin}
    />
}
