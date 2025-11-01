import {useState} from 'preact/hooks'
import {route} from 'preact-router'
import {Button, FieldText, Icon} from '@garage44/common/components'
import {$t, api, notifier} from '@garage44/common/app'
import {$s} from '@/app'

export const Login = () => {
    const [errors, setErrors] = useState({ username: [], password: [] })

    const login = async () => {
        setErrors({ username: [], password: [] })

        const context = await api.post('/api/login', {
            password: $s.profile.password,
            username: $s.profile.username,
        })

        Object.assign($s.admin, context)

        if (!context.authenticated || (context.authenticated && !context.permission)) {
            let message

            if (!context.authenticated) {
                message = $t('user.login.credentials_invalid')
            } else if (context.authenticated && !context.permission) {
                message = $t('user.login.no_permission')
            }
            notifier.notify({ level: 'error', message })
            setErrors({ username: [message], password: [message] })
        } else {
            notifier.notify({ level: 'info', message: $t('user.login.succesful') })
            route('/admin/users')
        }
    }

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter') login()
    }

    return (
        <div class="c-admin-login content" onKeyPress={handleKeyPress}>
            <header>
                <div class="notice" />
                <div class="title">
                    <span>{$t('user.login.management')}</span>
                    <Icon class="item-icon icon-d" name="dashboard" />
                </div>
            </header>
            <div class="panels">
                <section>
                    <FieldText
                        value={$s.profile.username}
                        onChange={(value) => $s.profile.username = value}
                        autocomplete="username"
                        autofocus={true}
                        label={$t('user.username')}
                        name="username"
                        placeholder={$t('user.username_placeholder')}
                    />

                    <FieldText
                        value={$s.profile.password}
                        onChange={(value) => $s.profile.password = value}
                        autocomplete="password"
                        label={$t('user.password')}
                        name="password"
                        placeholder={$t('user.password_placeholder')}
                        type="password"
                    />
                </section>
                <div class="actions">
                    <Button
                        icon="Login"
                        tip={$t('user.login.as_admin')}
                        variant="menu"
                        onClick={login}
                    />
                </div>
            </div>
        </div>
    )
}
