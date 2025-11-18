import {FieldSelect, Icon, SoundMeter as Soundmeter} from '@garage44/common/components'
import Sound from '@/lib/sound'
import {Stream} from '@/components/stream/stream'
import {useState, useEffect} from 'preact/hooks'
import {$s} from '@/app'
import {$t} from '@garage44/common/app'
import {getUserMedia, queryDevices, localStream} from '@/models/media'
import * as sfu from '@/models/sfu/sfu'

/**
 * Device Settings Component for PanelContext Quick Access
 * Contains only device selection (cam, mic, audio) - no media settings
 */
export function DeviceSettings() {
    const [description, setDescription] = useState<MediaDeviceInfo | null>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [streamId, setStreamId] = useState<string | null>(null)
    const [soundAudio, setSoundAudio] = useState<Sound | null>(null)
    const [playing] = useState(false)

    const remountStream = async () => {
        const newStream = await getUserMedia()
        if (newStream) {
            setStream(newStream)
            setStreamId(newStream.id)
            setDescription(null)

            // Give the stream time to unmount first...
            await new Promise((resolve) => setTimeout(resolve, 0))

            setDescription({
                direction: 'up',
                hasAudio: $s.devices.mic.enabled,
                hasVideo: $s.devices.cam.enabled,
                id: newStream.id,
                kind: 'video',
                mirror: false,
                src: newStream,
                volume: {
                    locked: false,
                    value: 100,
                },
            })
        }
    }

    const testSoundAudio = () => {if (soundAudio) {
soundAudio.play()
}}

    // Initial mount
    useEffect(() => {
        const init = async () => {
            await queryDevices()
            setSoundAudio(new Sound({file: '/audio/power-on.ogg', playing: false}))

            // Only use existing stream if available
            const currentStream = localStream
            if (currentStream && !$s.sfu.channel.connected) {
                setStream(currentStream)
                setStreamId(currentStream.id)
                setDescription({
                    direction: 'up',
                    hasAudio: $s.devices.mic.enabled,
                    hasVideo: $s.devices.cam.enabled,
                    id: currentStream.id,
                    kind: 'video',
                    mirror: false,
                    src: currentStream,
                    volume: {
                        locked: false,
                        value: 100,
                    },
                })
            }
        }

        init()

        return () => {if (!$s.sfu.channel.connected) {
sfu.delLocalMedia()
}}
    }, [])

    // Watch for device changes
    useEffect(() => {
remountStream()
}, [$s.devices.cam.resolution, $s.devices.cam.selected, $s.devices.mic.selected])

    return (
        <div class='c-device-settings'>
            <div class='c-device-settings__section'>
                <h3 class='c-device-settings__title'>Camera</h3>
                <FieldSelect
                    model={$s.devices.cam.$selected}
                    onChange={(value) => $s.devices.cam.selected = value}
                    help={$t('device.select_cam_help')}
                    label={$t('device.select_cam_label')}
                    name='video'
                    options={$s.devices.cam.options}
                />
                {description && <Stream modelValue={description} controls={false} />}
                {!description && (
                    <div class='c-device-settings__placeholder'>
                        <Icon name='webcam' />
                    </div>
                )}
            </div>

            <div class='c-device-settings__section'>
                <h3 class='c-device-settings__title'>Microphone</h3>
                <FieldSelect
                    model={$s.devices.mic.$selected}
                    onChange={(value) => $s.devices.mic.selected = value}
                    help={$t('device.select_mic_verify_help')}
                    label={$t('device.select_mic_label')}
                    name='audio'
                    options={$s.devices.mic.options}
                />
                {streamId && stream && <Soundmeter stream={stream} streamId={streamId} />}
            </div>

            <div class='c-device-settings__section'>
                <h3 class='c-device-settings__title'>Audio Output</h3>
                {$s.devices.audio.options.length && !$s.env.isFirefox && (
                    <FieldSelect
                        model={$s.devices.audio.$selected}
                        onChange={(value) => $s.devices.audio.selected = value}
                        help={$t('device.select_audio_verify_help')}
                        label={$t('device.select_audio_label')}
                        name='audio'
                        options={$s.devices.audio.options}
                    />
                )}

                {($s.env.isFirefox || !$s.devices.audio.options.length) && (
                    <div class='c-device-settings__audio-test'>
                        <label>{$t('device.select_audio_label')}</label>
                        <button class='btn' disabled={playing} onClick={testSoundAudio}>
                            <Icon class='icon-d' name='play' />
                        </button>
                        <p class='c-device-settings__help'>{$t('device.select_audio_verify_help')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
