import {useEffect, useState, useMemo} from 'preact/hooks'
import {Button, FieldUpload as FieldFile, FieldSlider, Icon} from '@garage44/common/components'
import {unreadMessages} from '@/models/chat'
import {$s} from '@/app'
import {$t, logger, store} from '@garage44/common/app'
import * as sfu from '@/models/sfu/sfu'
import * as media from '@/models/media'

export const GroupControls = () => {
    const [volume, setVolume] = useState({ locked: null, value: 100 })

    const fileMediaAccept = useMemo(() => {
        if ($s.env.isFirefox) {
            return '.mp4'
        } else {
            // Chromium supports at least these 3 formats:
            return '.mp4,.mkv,.webm'
        }
    }, [$s.env.isFirefox])

    const filePlayTooltip = useMemo(() => {
        if ($s.files.playing.length) {
            return $t('file.streaming')
        }
        let formats = []
        if ($s.env.isFirefox) {
            formats.push('.mp4')
        } else {
            formats.push('.mp4', 'webm', 'mkv')
        }
        return $t('file.stream', { formats: formats.join(',') })
    }, [$s.files.playing.length, $s.env.isFirefox])

    const unreadCount = useMemo(() => unreadMessages(), [$s.chat.channels])

    const toggleCam = () => {
        $s.devices.cam.enabled = !$s.devices.cam.enabled
        logger.debug(`switching cam stream: ${$s.devices.cam.enabled}`)
        sfu.delUpMediaKind('camera')
        media.getUserMedia($s.devices)
    }

    const toggleChat = async () => {
        // Don't do a collapse animation while emoji is active; this is
        // too heavy due to the 1800+ items grid layout.
        $s.chat.emoji.active = false
        // Wait a tick for state to update
        await new Promise(resolve => setTimeout(resolve, 0))
        $s.panels.chat.collapsed = !$s.panels.chat.collapsed
        store.save()
    }

    const toggleMicrophone = () => {
        let shouldRestartStream = !$s.devices.cam.enabled
        sfu.muteMicrophone($s.devices.mic.enabled)
        if (shouldRestartStream) {
            // When both the camera is off, toggling the microphone should also restart the stream.
            // Otherwise, we would either continue to stream empty data (when both camera and mic are
            // off), or we would not send our audio stream altogether.
            media.getUserMedia($s.devices)
        }
    }

    const togglePlayFile = (file: File | null) => {
        if (file) {
            sfu.addFileMedia(file)
        } else {
            $s.files.playing = []
            sfu.delUpMediaKind('video')
        }
    }

    const toggleRaiseHand = () => {
        sfu.connection?.userAction('setdata', sfu.connection.id, { raisehand: !$s.user.data.raisehand })
        if (!$s.user.data.raisehand) {
            sfu.connection?.userMessage('raisehand')
        }
    }

    const toggleScreenshare = async () => {
        if ($s.upMedia.screenshare.length) {
            logger.debug('turn screenshare stream off')
            sfu.delUpMedia(media.screenStream)
        } else {
            logger.debug('turn screenshare stream on')
            const stream = await sfu.addShareMedia()
            media.setScreenStream(stream)
        }
    }

    // Watch mic enabled
    useEffect(() => {
        if (sfu.connection) {
            sfu.connection.userAction('setdata', sfu.connection.id, { mic: $s.devices.mic.enabled })
        }
    }, [$s.devices.mic.enabled])

    // Watch permissions.present
    useEffect(() => {
        if ($s.permissions.present) {
            media.getUserMedia($s.devices)
        }
    }, [$s.permissions.present])

    // Watch volume changes
    useEffect(() => {
        for (const description of $s.streams) {
            // Only downstreams have volume control:
            if (description.direction === 'down' && !description.volume.locked) {
                description.volume = volume
            }
        }
    }, [volume])

    return (
        <div class="c-group-controls">
            <Button
                active={!$s.panels.chat.collapsed}
                icon="Chat"
                icon-props={{ unread: unreadCount }}
                tip={$s.panels.chat.collapsed ? $t('ui.panel_chat.expand') : $t('ui.panel_chat.collapse')}
                variant="toggle"
                onClick={toggleChat}
            />

            {$s.permissions.present && (
                <>
                    <Button
                        active={$s.devices.mic.enabled ? $s.devices.mic.enabled : null}
                        icon={$s.devices.mic.enabled ? 'Mic' : 'MicMute'}
                        tip={$s.devices.mic.enabled ? $t('group.action.mic_off') : $t('group.action.mic_on')}
                        variant="toggle"
                        onClick={toggleMicrophone}
                    />

                    <Button
                        active={$s.devices.cam.enabled}
                        disabled={!$s.mediaReady}
                        icon="Webcam"
                        tip={$s.devices.cam.enabled ? $t('group.action.cam_off') : $t('group.action.cam_on')}
                        variant="toggle"
                        onClick={toggleCam}
                    />

                    <Button
                        active={!!$s.upMedia.screenshare.length}
                        icon="ScreenShare"
                        tip={$s.upMedia.screenshare.length ? $t('group.action.screenshare_off') : $t('group.action.screenshare_on')}
                        variant="toggle"
                        onClick={toggleScreenshare}
                    />

                    <Button
                        active={!!$s.upMedia.video.length}
                        variant="toggle"
                    >
                        <FieldFile
                            value={$s.files.playing}
                            accept={fileMediaAccept}
                            tooltip={filePlayTooltip}
                            onFile={togglePlayFile}
                        />
                    </Button>
                </>
            )}

            {$s.group.connected && (
                <Button
                    active={$s.user.data.raisehand}
                    icon="Hand"
                    tip={$s.user.data.raisehand ? $t('group.action.raisehand_active') : $t('group.action.raisehand')}
                    variant="toggle"
                    onClick={toggleRaiseHand}
                />
            )}

            <Button
                class="no-feedback"
                tip={`${volume.value}% ${$t('group.audio_volume')}`}
                variant="unset"
            >
                <FieldSlider value={volume} onChange={setVolume} IconComponent={Icon} />
            </Button>
        </div>
    )
}
