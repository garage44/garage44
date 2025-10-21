import {useEffect, useState} from 'preact/hooks'
import {route} from 'preact-router'
import {Button, FieldCheckbox, FieldRadioGroup, FieldSelect, FieldText, Hint, Icon} from '@garage44/common/components'
import {$s, store} from '@/app'
import {$t, notifier} from '@garage44/common/app'
import {connect} from '@/models/sfu/sfu'
import {currentGroup} from '@/models/group'
import {queryDevices} from '@/models/media'

interface LoginProps {
    groupId?: string
}

export const Login = ({ groupId }: LoginProps) => {
    const [busy, setBusy] = useState(false)
    const [errors, setErrors] = useState({
        username: '',
        password: '',
    })

    const authOptions = [
        ['user', $t('user.name')],
        ['guest', $t('user.guest')],
        ['anonymous', $t('user.anonymous')],
    ]
    const guestToggle = ['user', 'guest']

    const group = currentGroup()
    const isListedGroup = !!$s.groups.find((i) => i.name === $s.group.name)

    const setAuthOption = (group: any) => {
        if (!group) return

        if (group.locked) {
            $s.user.authOption = 'user'
        } else {
            // Username already filled? Assume user authentication
            if ($s.user.username) {
                $s.user.authOption = 'user'
            } else if (group['allow-anonymous'] && group['public-access']) {
                $s.user.authOption = 'anonymous'
            } else if (group['public-access'] && !group['allow-anonymous']) {
                $s.user.authOption = 'guest'
            } else {
                $s.user.authOption = 'user'
            }
        }
    }

    const validateForm = () => {
        const newErrors = { username: '', password: '' }

        if ($s.user.authOption === 'user') {
            if (!$s.user.username) newErrors.username = $t('validation.required')
            if (!$s.user.password) newErrors.password = $t('validation.required')
        } else if ($s.user.authOption === 'guest') {
            if (!$s.user.username) newErrors.username = $t('validation.required')
        }

        setErrors(newErrors)
        return !newErrors.username && !newErrors.password
    }

    const clearCredentials = () => {
        $s.user.username = ''
        $s.user.password = ''
        store.save()
    }

    const login = async () => {
        if (!validateForm()) return

        setErrors({ username: '', password: '' })
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
            store.save()
            route(`/groups/${groupId}`)
        } catch (err) {
            if (err === 'group is locked') {
                const message = $t('fail_locked', { group: $s.group.name })
                notifier.notify({ level: 'error', message })
                setErrors({
                    username: $t('user.login.validate_locked'),
                    password: $t('user.login.validate_locked')
                })
            } else if (err === 'not authorised') {
                const message = $t('user.login.fail_credentials', { group: $s.group.name })
                notifier.notify({ level: 'error', message })
                setErrors({ username: message, password: message })
            }
        }

        setBusy(false)
    }

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter') login()
    }

    useEffect(() => {
        const group = currentGroup()
        setAuthOption(group)

        // Pre-populate with stored credentials if available
        if ($s.user.username) {
            // Credentials are already in $s.user from main login
        }

        ;(async () => {
            setBusy(true)
            await queryDevices()
            setBusy(false)
        })()
    }, [groupId])

    if (!group) return null

    const btnLoginDisabled = busy ||
        ($s.user.authOption === 'user' && (!$s.user.username || !$s.user.password)) ||
        ($s.user.authOption === 'guest' && !$s.user.username)

    return (
        <div class="c-login content" onKeyPress={handleKeyPress}>
            <header>
                <div class="notice">
                    {group.locked && <Hint class="field" text={$t('user.login.locked_maintenance')} />}
                </div>
                <div class="title">
                    <span>{groupId}</span>
                    <Icon class="icon icon-regular" name={group.locked ? 'GroupLocked' : 'Group'} />
                </div>
            </header>
            <div class="panels">
                <section>
                    <form autocomplete="off">
                        {!group.locked && (group['public-access'] && !group['allow-anonymous']) && (
                            <FieldCheckbox
                                value={$s.user.authOption}
                                onChange={(value) => $s.user.authOption = value}
                                label={$t('user.login.as_guest')}
                                toggle={guestToggle}
                            />
                        )}

                        {!group.locked && (group['allow-anonymous'] && group['public-access']) && (
                            <FieldRadioGroup
                                value={$s.user.authOption}
                                onChange={(value) => $s.user.authOption = value}
                                label={$t('user.login.as')}
                                options={authOptions}
                            />
                        )}

                        {!isListedGroup && (
                            <FieldText
                                value={group.name}
                                onChange={(value) => $s.group.name = value}
                                label={$t('group.name')}
                                name="groupname"
                            />
                        )}

                        {['user', 'guest'].includes($s.user.authOption) && (
                            <FieldText
                                value={$s.user.username}
                                onChange={(value) => { $s.user.username = value; setErrors({ ...errors, username: '' }) }}
                                autocomplete="off"
                                autofocus={$s.login.autofocus && groupId}
                                label={$t('user.username')}
                                name="username"
                                placeholder={$t('user.username_placeholder')}
                                error={errors.username}
                            />
                        )}

                        {$s.user.authOption === 'user' && (
                            <FieldText
                                value={$s.user.password}
                                onChange={(value) => { $s.user.password = value; setErrors({ ...errors, password: '' }) }}
                                autocomplete="password"
                                label={$t('user.password')}
                                name="password"
                                placeholder={$t('user.password_placeholder')}
                                type="password"
                                error={errors.password}
                            />
                        )}

                        {group.contact && (
                            <div class="group-contact">
                                <Icon class="icon-d" name="administrator" tip={$t('group.contact')} />
                                {group.contact}
                            </div>
                        )}

                        {group.comment && (
                            <div class="group-comment field">
                                <div class="field-label">
                                    {$t('group.about')} {group.name}
                                </div>
                                <div class="comment">
                                    {group.comment}
                                </div>
                            </div>
                        )}

                        <FieldSelect
                            value={$s.devices.cam.selected}
                            onChange={(value) => $s.devices.cam.selected = value}
                            disabled={!$s.devices.cam.enabled}
                            help={$t('device.select_cam_help')}
                            label={$t('device.select_cam_label')}
                            name="cam"
                            options={$s.devices.cam.options}
                        />

                        <FieldSelect
                            value={$s.devices.mic.selected}
                            onChange={(value) => $s.devices.mic.selected = value}
                            disabled={!$s.devices.mic.enabled}
                            help={$t('device.select_mic_help')}
                            label={$t('device.select_mic_label')}
                            name="mic"
                            options={$s.devices.mic.options}
                        />

                        {!$s.env.isFirefox && (
                            <div class="media-option">
                                <FieldSelect
                                    value={$s.devices.audio.selected}
                                    onChange={(value) => $s.devices.audio.selected = value}
                                    help={$s.env.isFirefox ? $t('ui.unsupported_option', { browser: $s.env.browserName }) : $t('device.select_audio_help')}
                                    label={$t('device.select_audio_label')}
                                    name="audio"
                                    options={$s.devices.audio.options}
                                />
                            </div>
                        )}
                    </form>

                    <div class="verify">
                        <a href={`/settings/devices`}>
                            {$t('group.verify_devices')}
                        </a>
                    </div>
                </section>
                <div class="actions">
                    <Button
                        disabled={btnLoginDisabled}
                        icon="Login"
                        tip={group.locked ? $t('group.join_locked') : $t('group.join')}
                        variant="menu"
                        onClick={login}
                    />

                    <Button
                        disabled={!$s.user.username && !$s.user.password}
                        icon="Backspace"
                        tip={$t('user.action.clear_credentials')}
                        variant="menu"
                        onClick={clearCredentials}
                    />
                </div>
            </div>
        </div>
    )
}
