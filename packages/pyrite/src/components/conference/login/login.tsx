// Conference login component - simplified version for now
// TODO: Implement full validation and device selection similar to old Pyrite
import {useState} from 'preact/hooks'
import {route} from 'preact-router'
import {Button, FieldText, Icon} from '@/components/elements'
import {$s} from '@/app'
import {$t, notifier} from '@garage44/common/app'
import {connect} from '@/models/sfu/sfu'

interface LoginProps {
    groupId?: string
}

export const Login = ({ groupId }: LoginProps) => {
    const [busy, setBusy] = useState(false)

    const login = async () => {
        setBusy(true)
        try {
            if ($s.user.authOption === 'user') {
                await connect($s.user.username, $s.user.password)
            } else if ($s.user.authOption === 'guest') {
                await connect($s.user.username, '')
            } else if ($s.user.authOption === 'anonymous') {
                await connect('', '')
            }

            $s.group.connected = true
            route(`/groups/${groupId}`)
        } catch (err) {
            if (err === 'group is locked') {
                notifier.notify({
                    level: 'error',
                    message: $t('fail_locked', { group: $s.group.name }),
                })
            } else if (err === 'not authorised') {
                notifier.notify({
                    level: 'error',
                    message: $t('user.login.fail_credentials', { group: $s.group.name }),
                })
            }
        }
        setBusy(false)
    }

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter') login()
    }

    return (
        <div class="c-login content" onKeyPress={handleKeyPress}>
            <header>
                <div class="notice" />
                <div class="title">
                    <span>{groupId}</span>
                    <Icon class="icon icon-regular" name="Group" />
                </div>
            </header>
            <div class="panels">
                <section>
                    <FieldText
                        value={$s.user.username}
                        onChange={(value) => $s.user.username = value}
                        label={$t('user.username')}
                        name="username"
                        placeholder={$t('user.username_placeholder')}
                        autofocus={true}
                    />

                    <FieldText
                        value={$s.user.password}
                        onChange={(value) => $s.user.password = value}
                        label={$t('user.password')}
                        name="password"
                        placeholder={$t('user.password_placeholder')}
                        type="password"
                    />
                </section>
                <div class="actions">
                    <Button
                        disabled={busy}
                        icon="Login"
                        tip={$t('group.join')}
                        variant="menu"
                        onClick={login}
                    />
                </div>
            </div>
        </div>
    )
}
