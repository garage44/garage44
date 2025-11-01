import {FieldSelect, Icon, SoundMeter as Soundmeter} from '@garage44/common/components'
import Sound from '@/lib/sound'
import {Stream} from '@/components/conference/stream/stream'
import {useState, useEffect} from 'preact/hooks'
import {$s} from '@/app'
import {$t, notifier} from '@garage44/common/app'
import {getUserMedia, queryDevices} from '@/models/media'
import {localStream, delLocalMedia} from '@/models/media'

export default function TabDevices() {
    const [description, setDescription] = useState<any>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [streamId, setStreamId] = useState<string | null>(null)
    const [soundAudio, setSoundAudio] = useState<Sound | null>(null)
    const [playing, setPlaying] = useState(false)

    const remountStream = async () => {
        const newStream = await getUserMedia()
        if (newStream) {
            setStream(newStream)
            setStreamId(newStream.id)
            setDescription(null)

            // Give the stream time to unmount first...
            await new Promise(resolve => setTimeout(resolve, 0))

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

    const testSoundAudio = () => {
        if (soundAudio) {
            soundAudio.play()
        }
    }

    // Initial mount
    useEffect(() => {
        const init = async () => {
            await queryDevices()
            setSoundAudio(new Sound({ file: '/audio/power-on.ogg', playing: false }))

            // Only use existing stream if available - don't auto-start media
            // Media should only start when user explicitly clicks camera/mic buttons
            // This prevents unwanted getUserMedia calls and permission prompts on page load
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

        return () => {
            if (!$s.sfu.channel.connected) {
                delLocalMedia()
            }
        }
    }, [])

    // Watch for device changes
    useEffect(() => {
        remountStream()
    }, [$s.devices.cam.resolution, $s.devices.cam.selected, $s.devices.mic.selected])

    return (
        <section class="c-tab-devices tab-content active">
            <div class="camera-field">
                <FieldSelect
                    value={$s.devices.cam.selected}
                    onChange={(value) => $s.devices.cam.selected = value}
                    help={$t('device.select_cam_help')}
                    label={$t('device.select_cam_label')}
                    name="video"
                    options={$s.devices.cam.options}
                />

                {description && <Stream modelValue={description} controls={false} />}
                {!description && (
                    <div class="webcam-placeholder">
                        <Icon name="webcam" />
                    </div>
                )}
            </div>

            <FieldSelect
                value={$s.devices.mic.selected}
                onChange={(value) => $s.devices.mic.selected = value}
                help={$t('device.select_mic_verify_help')}
                label={$t('device.select_mic_label')}
                name="audio"
                options={$s.devices.mic.options}
            />

            <div class="soundmeter">
                {streamId && stream && <Soundmeter stream={stream} streamId={streamId} />}
            </div>

            <div class="output-config">
                {/* https://bugzilla.mozilla.org/show_bug.cgi?id=1498512 */}
                {/* https://bugzilla.mozilla.org/show_bug.cgi?id=1152401 */}
                {$s.devices.audio.options.length && !$s.env.isFirefox && (
                    <FieldSelect
                        value={$s.devices.audio.selected}
                        onChange={(value) => $s.devices.audio.selected = value}
                        help={$t('device.select_audio_verify_help')}
                        label={$t('device.select_audio_label')}
                        name="audio"
                        options={$s.devices.audio.options}
                    />
                )}

                {($s.env.isFirefox || !$s.devices.audio.options.length) && (
                    <div class="field">
                        <div class="label-container">
                            <label class="field-label">{$t('device.select_audio_label')}</label>
                            <button class="btn" disabled={playing} onClick={testSoundAudio}>
                                <Icon class="icon-d" name="play" />
                            </button>
                        </div>

                        <div class="help">
                            {$t('device.select_audio_verify_help')}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
