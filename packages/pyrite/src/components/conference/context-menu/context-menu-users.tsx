import classnames from 'classnames'
import {ContextInput, ContextSelect, FieldFile, Icon} from '@/components/elements'
import {useState} from 'preact/hooks'
import {$s} from '@/app'
import {$t, events, notifier} from '@garage44/common/app'
import {connection} from '@/models/sfu/sfu'

interface UsersContextMenuProps {
    user: any // TODO: Define proper user type
}

export default function UsersContextMenu({ user }: UsersContextMenuProps) {
    const [active, setActive] = useState(false)

    const statusOptions = [
        {id: 'available', name: $t('user.action.set_availability.available')},
        {id: 'away', name: $t('user.action.set_availability.away')},
        {id: 'busy', name: $t('user.action.set_availability.busy')},
    ]

    const warning = {icon: 'Megafone', title: $t('user.action.notify')}
    const kick = {icon: 'Kick', title: `${$t('user.action.kick', {username: user.username})}`}

    const activateUserChat = () => {
        events.emit('channel', {
            action: 'switch',
            channel: {
                id: user.id,
                messages: [],
                name: user.username,
                unread: 0,
            },
            channelId: user.id,
        })
        $s.panels.chat.collapsed = false
        toggleMenu()
    }

    const kickUser = (text: string) => {
        notifier.message('kicked', {dir: 'source', target: user.username})
        connection?.userAction('kick', user.id, text)
        toggleMenu()
    }

    const muteUser = () => {
        notifier.message('mute', {dir: 'source', target: user.username})
        connection?.userMessage('mute', user.id, null)
        toggleMenu()
    }

    const sendFile = (file: File | null) => {
        if (file) {
            connection?.sendFile(user.id, file)
        } else {
            $s.files.upload = []
        }
    }

    const sendNotification = (message: string) => {
        notifier.message('notification', {dir: 'source', message, target: user.username})
        connection?.userMessage('notification', user.id, message)
        toggleMenu()
    }

    const setAvailability = (availability: any) => {
        connection?.userAction('setdata', connection.id, {availability})
    }

    const toggleMenu = (e?: any, forceState?: any) => {
        // The click-outside
        if (typeof forceState === 'object') {
            setActive(false)
            return
        }

        setActive(prev => !prev)
    }

    const toggleOperator = () => {
        let action
        if (user.permissions.op) action = 'unop'
        else action = 'op'

        notifier.message(action, {dir: 'source', target: user.username})
        connection?.userAction(action, user.id)
        toggleMenu()
    }

    const togglePresenter = () => {
        let action
        if (user.permissions.present) action = 'unpresent'
        else action = 'present'

        notifier.message(action, {dir: 'source', target: user.username})
        connection?.userAction(action, user.id)
        toggleMenu()
    }

    return (
        <div class={classnames('c-users-context-menu context-menu', {active: active})}>
            <Icon class="icon icon-d" name="menu" onClick={toggleMenu} />
            {active && <div class="context-actions">
                {user.id !== $s.user.id && <button class="action" onClick={activateUserChat}>
                    <Icon class="icon icon-s" name="chat" />
                    {`${$t('user.action.chat', {username: user.username})}`}
                </button>}

                {user.id !== $s.user.id && <button class="action">
                    <FieldFile
                        value={$s.files.upload}
                        accept="*"
                        icon="Upload"
                        label={$t('user.action.share_file.send')}
                        onFile={sendFile}
                    />
                </button>}

                {($s.permissions.op && user.id !== $s.user.id) && <ContextInput
                    value={warning}
                    submit={sendNotification}
                />}

                {($s.permissions.op && user.id !== $s.user.id) && <button class="action" onClick={muteUser}>
                    <Icon class="icon icon-s" name="mic" />
                    {$t('user.action.mute_mic')}
                </button>}

                {($s.permissions.op && user.id !== $s.user.id) && <button class="action" onClick={toggleOperator}>
                    <Icon class="icon icon-s" name="operator" />
                    {user.permissions.op ? $t('user.action.set_role.op_retract') : $t('user.action.set_role.op_assign')}
                </button>}

                {($s.permissions.op && user.id !== $s.user.id) && <button class="action" onClick={togglePresenter}>
                    <Icon class="icon icon-s" name="present" />
                    {user.permissions.present ? $t('user.action.set_role.present_retract') : $t('user.action.set_role.present_assign')}
                </button>}

                {user.id === $s.user.id && <ContextSelect
                    value={$s.user.data.availability}
                    icon="User"
                    options={statusOptions}
                    submit={setAvailability}
                    title={$t(`user.action.set_availability.${$s.user.data.availability.id}`)}
                />}

                {(user.id !== $s.user.id && $s.permissions.op) && <ContextInput
                    value={kick}
                    required={false}
                    submit={kickUser}
                />}

            </div>}
        </div>
    )
}
