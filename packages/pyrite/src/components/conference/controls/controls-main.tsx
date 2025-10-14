import {Button} from '@/components/elements'
import {useMemo} from 'preact/hooks'
import {$s} from '@/app'
import {$t, store} from '@garage44/common/app'
import {currentGroup} from '@/models/group'
import {connection, disconnect} from '@/models/sfu/sfu'

interface ControlsMainProps {
    path?: string
}

export default function ControlsMain({ path }: ControlsMainProps) {
    const currentGroupData = useMemo(() => currentGroup(), [$s.group.name, $s.groups])

    const groupRoute = useMemo(() => {
        if ($s.group.name) {
            return `/groups/${$s.group.name}`
        } else {
            return '/'
        }
    }, [$s.group.name])

    const settingsRoute = useMemo(() => {
        if (!$s.group.connected) {
            return '/settings/misc'
        }
        if (path === '/settings') {
            return `/groups/${$s.group.name}`
        } else {
            return '/settings/misc'
        }
    }, [$s.group.connected, path, $s.group.name])

    const clearChat = () => {
        connection?.groupAction('clearchat')
    }

    const muteAllUsers = () => {
        connection?.userMessage('mute', null, null)
    }

    const sendNotification = (text: string) => {
        connection?.userMessage('notification', null, text)
    }

    const toggleCollapse = () => {
        $s.panels.context.collapsed = !$s.panels.context.collapsed
        store.save()
    }

    const toggleLockGroup = (text: string) => {
        if (currentGroupData.locked) {
            connection?.groupAction('unlock')
        } else {
            connection?.groupAction('lock', text)
        }
    }

    const toggleRecording = () => {
        if ($s.group.recording) {
            connection?.groupAction('unrecord')
        } else {
            connection?.groupAction('record')
        }
    }

    const isSettingsRoute = path?.includes('/settings')

    return (
        <nav class="c-general-controls">
            <div class="navigational-controls">
                {!$s.group.connected && (
                    <Button
                        active={path?.includes('/groups')}
                        disabled={!$s.group.name && !$s.group.connected}
                        icon={currentGroupData.locked ? 'GroupLocked' : 'Group'}
                        route={groupRoute}
                        tip={currentGroupData.locked ? `${$t('group.current')} (${$t('group.locked')})` : $t('group.current')}
                        variant="menu"
                    />
                )}

                {$s.group.connected && $s.permissions.op && (
                    <Button
                        context={{
                            enabled: true,
                            placeholder: $t('group.action.notify_context'),
                            submit: sendNotification,
                        }}
                        icon="Megafone"
                        tip={$t('group.action.notify')}
                        variant="menu"
                    />
                )}

                {$s.group.connected && $s.permissions.record && (
                    <Button
                        icon={$s.group.recording ? 'Unrecord' : 'Record'}
                        tip={$s.group.recording ? $t('group.action.stop_recording') : $t('group.action.start_recording')}
                        variant="menu"
                        onClick={toggleRecording}
                    />
                )}

                {$s.group.connected && $s.permissions.op && (
                    <Button
                        context={{
                            enabled: !currentGroupData.locked,
                            placeholder: $t('group.action.lock_context'),
                            submit: toggleLockGroup,
                        }}
                        icon={currentGroupData.locked ? 'Unlock' : 'Lock'}
                        tip={currentGroupData.locked ? $t('group.action.unlock') : $t('group.action.lock')}
                        variant="menu"
                    />
                )}

                {$s.group.connected && $s.permissions.op && (
                    <Button
                        icon="MicMute"
                        tip={$t('group.action.mute_participants')}
                        variant="menu"
                        onClick={muteAllUsers}
                    />
                )}

                {$s.group.connected && $s.permissions.op && (
                    <Button
                        icon="ChatRemove"
                        tip={$t('group.action.clear_chat')}
                        variant="menu"
                        onClick={clearChat}
                    />
                )}

                {$s.group.connected && (
                    <Button
                        class="btn-logout"
                        icon="Logout"
                        tip={$t('group.action.leave')}
                        variant="menu"
                        onClick={disconnect}
                    />
                )}
            </div>

            <div class="toggles">
                <Button
                    active={isSettingsRoute}
                    icon="Settings"
                    route={settingsRoute}
                    tip={$t('group.settings.name')}
                    variant="toggle"
                />

                {$s.env.layout === 'desktop' && (
                    <Button
                        active={!$s.panels.context.collapsed}
                        icon="ViewList"
                        tip={$s.panels.context.collapsed ? $t('ui.panel.expand') : $t('ui.panel.collapse')}
                        variant="toggle"
                        onClick={toggleCollapse}
                    />
                )}
            </div>
        </nav>
    )
}
