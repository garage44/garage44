import {Button} from '@garage44/common/components'
import {useMemo} from 'preact/hooks'
import {$s} from '@/app'
import {$t, store, logger} from '@garage44/common/app'
import {currentGroup} from '@/models/group'
import {connection, disconnect} from '@/models/sfu/sfu'
import * as media from '@/models/media'
import * as sfu from '@/models/sfu/sfu'
import './controls-main.css'

interface ControlsMainProps {
    path?: string
}

export function ControlsMain({path}: ControlsMainProps) {
    // DeepSignal is reactive - accessing $s properties makes components reactive automatically
    const currentGroupData = useMemo(() => currentGroup(), [])

    const groupRoute = useMemo(() => {
        if ($s.sfu.channel.name) {
            return `/groups/${$s.sfu.channel.name}`
        }
        return '/'
    }, [])

    const currentChannelSlug = $s.chat.activeChannelSlug

    // Check if channel is connected
    const isChannelConnected = currentChannelSlug ? ($s.sfu.channels[currentChannelSlug]?.connected || false) : false

    const settingsRoute = useMemo(() => {
        if (!isChannelConnected) {
            return '/settings/misc'
        }
        if (path === '/settings') {
            return `/groups/${$s.sfu.channel.name}`
        }
        return '/settings/misc'
    }, [path, isChannelConnected])

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
        if ($s.sfu.channel.recording) {
            connection?.groupAction('unrecord')
        } else {
            connection?.groupAction('record')
        }
    }

    const toggleCamera = () => {
        if (!currentChannelSlug) {
            logger.warn('[ControlsMain] No active channel, cannot toggle camera')
            return
        }

        // Initialize channel state if it doesn't exist
        if (!$s.sfu.channels[currentChannelSlug]) {
            $s.sfu.channels[currentChannelSlug] = {audio: false, connected: false, video: false}
        }

        // Toggle video state
        const newVideoState = !$s.sfu.channels[currentChannelSlug].video
        $s.sfu.channels[currentChannelSlug].video = newVideoState

        // Update device state to match channel state
        $s.devices.cam.enabled = newVideoState

        logger.debug(`[ControlsMain] toggleCamera: channel=${currentChannelSlug}, video=${newVideoState}`)

        if (newVideoState) {
            // Camera enabled - get new media
            logger.debug('[ControlsMain] requesting camera media')
            media.getUserMedia($s.devices)
        } else {
            // Camera disabled - remove existing camera stream
            logger.debug('[ControlsMain] removing camera stream')
            sfu.delUpMediaKind('camera')
        }

        // Save state
        store.save()
    }

    const isSettingsRoute = path?.includes('/settings')

    return <nav class="c-general-controls">
        <div class="navigational-controls">

            {isChannelConnected && $s.permissions.record && <Button
                active={$s.sfu.channel.recording}
                icon={$s.sfu.channel.recording ? 'unrecord' : 'record'}
                tip={$s.sfu.channel.recording ? $t('group.action.stop_recording') : $t('group.action.start_recording')}
                variant="toggle"
                onClick={toggleRecording}
            />}

            {isChannelConnected && $s.permissions.op && <Button
                active={currentGroupData.locked}
                context={{
                    enabled: !currentGroupData.locked,
                    placeholder: $t('group.action.lock_context'),
                    submit: toggleLockGroup,
                }}
                icon={currentGroupData.locked ? 'unlock' : 'lock'}
                tip={currentGroupData.locked ? $t('group.action.unlock') : $t('group.action.lock')}
                variant="toggle"
            />}

            {isChannelConnected && $s.permissions.op && <Button
                icon="micmute"
                tip={$t('group.action.mute_participants')}
                variant="toggle"
                onClick={muteAllUsers}
            />}

            {isChannelConnected && currentChannelSlug && <Button
                active={$s.sfu.channels[currentChannelSlug]?.video || false}
                icon="webcam"
                tip={$s.sfu.channels[currentChannelSlug]?.video ? $t('group.action.cam_off') : $t('group.action.cam_on')}
                variant="toggle"
                onClick={toggleCamera}
            />}
            <Button
                active={isSettingsRoute}
                icon="cog_outline"
                route={settingsRoute}
                tip={$t('group.settings.name')}
                variant="toggle"
            />
        </div>
    </nav>
}
