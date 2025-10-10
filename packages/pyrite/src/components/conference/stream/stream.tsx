import {classes} from '@garage44/common/lib/utils'
import {useEffect, useRef, useState, useMemo} from 'preact/hooks'
import {Button, FieldSlider, SoundMeter} from '@/components/elements'
import {Icon} from '@/components/elements'
import {Reports} from './reports'
import {$s, $t} from '@/app'
import {logger} from '@garage44/common/app'
import * as sfu from '@/models/sfu/sfu'

interface StreamProps {
    controls?: boolean
    modelValue: any
    onUpdate?: (value: any) => void
}

export const Stream = ({ controls = true, modelValue, onUpdate }: StreamProps) => {
    const rootRef = useRef<HTMLDivElement>(null)
    const mediaRef = useRef<HTMLVideoElement>(null)
    const [bar, setBar] = useState({ active: false })
    const [mediaFailed, setMediaFailed] = useState(false)
    const [muted, setMuted] = useState(false)
    const [pip, setPip] = useState({ active: false, enabled: false })
    const [stats, setStats] = useState({ visible: false })
    const [stream, setStream] = useState<MediaStream | null>(null)
    const glnStreamRef = useRef<any>(null)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)

    // Computed values
    const audioEnabled = useMemo(() => {
        return !!(modelValue.hasAudio && stream && stream.getAudioTracks().length)
    }, [modelValue.hasAudio, stream])

    const fullscreenEnabled = useMemo(() => {
        return mediaRef.current?.requestFullscreen ? true : false
    }, [mediaRef.current])

    const hasSettings = useMemo(() => {
        if (!modelValue?.settings) return false
        return (
            Object.keys(modelValue.settings.audio).length ||
            Object.keys(modelValue.settings.video).length
        )
    }, [modelValue?.settings])

    const pipEnabled = useMemo(() => {
        return mediaRef.current?.requestPictureInPicture ? true : false
    }, [mediaRef.current])

    // Methods
    const loadSettings = async () => {
        if (!stream) return
        logger.debug('loading stream settings')
        const settings = { audio: {}, video: {} }

        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length) {
            settings.audio = audioTracks[0].getSettings()
        }

        const videoTracks = stream.getVideoTracks()
        if (videoTracks.length) {
            settings.video = videoTracks[0].getSettings()
        }

        if (onUpdate) {
            onUpdate({ ...modelValue, settings })
        }
    }

    const mountDownstream = async () => {
        const glnStream = sfu.connection?.down[modelValue.id]

        if (!glnStream) {
            logger.debug(`no sfu stream on mounting stream ${modelValue.id}`)
            return
        } else {
            logger.debug(`mount downstream ${modelValue.id}`)
        }

        glnStreamRef.current = glnStream
        setStream(glnStream.stream)

        // No need for further setup; this is an existing stream.
        if (sfu.connection.down[modelValue.id].stream && mediaRef.current) {
            mediaRef.current.srcObject = sfu.connection.down[modelValue.id].stream
            await playStream()
            return
        }

        glnStream.ondowntrack = (track: MediaStreamTrack) => {
            if (!stream) {
                setStream(glnStream.stream)
            }

            logger.debug(`downstream ondowntrack/${glnStream.id}`)
            // An incoming audio-track; enable volume controls.
            if (track.kind === 'audio') {
                logger.debug(`stream ondowntrack - enable audio controls`)
                if (onUpdate) onUpdate({ ...modelValue, hasAudio: true })
            } else if (track.kind === 'video') {
                if (onUpdate) onUpdate({ ...modelValue, hasVideo: true })
            }
        }

        glnStream.onclose = () => {
            sfu.delMedia(glnStream.id)
        }

        glnStream.onstatus = async (status: string) => {
            if (['connected', 'completed'].includes(status) && mediaRef.current) {
                mediaRef.current.srcObject = stream
                // Firefox doesn't have a working setSinkId
                if (audioEnabled && (mediaRef.current as any).setSinkId) {
                    logger.debug(`set stream sink: ${$s.devices.audio.selected.id}`)
                    ;(mediaRef.current as any).setSinkId($s.devices.audio.selected.id)
                }

                await playStream()
            }
        }
    }

    const mountUpstream = async () => {
        // Mute local streams, so people don't hear themselves talk.
        if (!muted) {
            toggleMuteVolume()
        }
        logger.debug(`mount upstream ${modelValue.id}`)

        if (!modelValue.src) {
            // Local media stream from a device.
            const glnStream = sfu.connection?.up[modelValue.id]
            glnStreamRef.current = glnStream
            setStream(glnStream.stream)
            if (mediaRef.current) {
                mediaRef.current.srcObject = glnStream.stream
            }
            await playStream()
        } else {
            // Local media stream playing from a file...
            if (modelValue.src instanceof File) {
                const url = URL.createObjectURL(modelValue.src)
                if (mediaRef.current) {
                    mediaRef.current.src = url
                }

                let capturedStream: MediaStream | null = null
                if ((mediaRef.current as any)?.captureStream) {
                    capturedStream = (mediaRef.current as any).captureStream()
                } else if ((mediaRef.current as any)?.mozCaptureStream) {
                    capturedStream = (mediaRef.current as any).mozCaptureStream()
                }

                if (capturedStream) {
                    setStream(capturedStream)
                }

                const glnStream = sfu.connection?.up[modelValue.id]
                glnStreamRef.current = glnStream
                if (glnStream) {
                    glnStream.userdata.play = true

                    if (capturedStream) {
                        capturedStream.onaddtrack = (e: MediaStreamTrackEvent) => {
                            const track = e.track

                            if (track.kind === 'audio') {
                                if (onUpdate) onUpdate({ ...modelValue, hasAudio: true })
                            } else if (track.kind === 'video') {
                                if (onUpdate) onUpdate({ ...modelValue, hasVideo: true })
                            }

                            glnStream.pc.addTrack(track, capturedStream)
                        }

                        capturedStream.onremovetrack = () => {
                            if (mediaRef.current?.src) {
                                sfu.delUpMedia(glnStream)
                                $s.files.playing = []
                            }
                        }
                    }

                    glnStream.onstatus = async (status: string) => {
                        if (status === 'connected') {
                            await loadSettings()
                        }
                    }
                }
            } else if (modelValue.src instanceof MediaStream) {
                // Local MediaStream (not part of Galene); e.g. Webcam test
                setStream(modelValue.src)
                if (mediaRef.current) {
                    mediaRef.current.srcObject = modelValue.src
                }
                await playStream()
            } else {
                throw new Error('invalid Stream source type')
            }
        }

        // A local stream that's not networked (e.g. cam preview in settings)
        if (!glnStreamRef.current) return

        glnStreamRef.current.stream = stream
    }

    const playStream = async () => {
        try {
            await mediaRef.current?.play()
            await loadSettings()
            if (onUpdate) onUpdate({ ...modelValue, playing: true })
        } catch (message) {
            if (glnStreamRef.current) {
                sfu.delMedia(glnStreamRef.current.id)
            }
            logger.warn(`stream terminated unexpectedly: ${message}`)
        }
    }

    const setFullscreen = () => {
        mediaRef.current?.requestFullscreen()
    }

    const setPipMode = () => {
        if (pip.active) {
            document.exitPictureInPicture()
        } else {
            mediaRef.current?.requestPictureInPicture()
        }
    }

    const toggleEnlarge = () => {
        for (const stream of $s.streams) {
            if (stream.id !== modelValue.id) {
                stream.enlarged = false
            }
        }
        if (onUpdate) onUpdate({ ...modelValue, enlarged: !modelValue.enlarged })
    }

    const toggleMuteVolume = () => {
        setMuted(!muted)
        if (mediaRef.current) {
            mediaRef.current.muted = !muted
        }
    }

    const toggleStats = () => {
        setStats({ visible: !stats.visible })
    }

    const toggleStreamBar = (active: boolean) => () => {
        setBar({ active })
    }

    const handleVolumeChange = (volume: number) => {
        if (onUpdate) {
            onUpdate({ ...modelValue, volume: { ...modelValue.volume, value: volume } })
        }
    }

    // Watch volume changes
    useEffect(() => {
        if (mediaRef.current && modelValue.volume?.value !== undefined) {
            mediaRef.current.volume = modelValue.volume.value / 100
        }
    }, [modelValue.volume?.value])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            logger.debug(`unmounting ${modelValue.direction} stream ${modelValue.id}`)
            if (mediaRef.current?.src) {
                URL.revokeObjectURL(mediaRef.current.src)
            } else if (mediaRef.current) {
                mediaRef.current.srcObject = null
            }
        }
    }, [])

    // Mount logic
    useEffect(() => {
        if (!rootRef.current || !mediaRef.current) return

        // Directly set the default aspect-ratio
        rootRef.current.style.setProperty('--aspect-ratio', String(modelValue.aspectRatio))

        // Firefox doesn't support this API (yet).
        if ((mediaRef.current as any).requestPictureInPicture) {
            const enterPip = () => setPip({ ...pip, active: true })
            const leavePip = () => setPip({ ...pip, active: false })

            mediaRef.current.addEventListener('enterpictureinpicture', enterPip)
            mediaRef.current.addEventListener('leavepictureinpicture', leavePip)

            return () => {
                mediaRef.current?.removeEventListener('enterpictureinpicture', enterPip)
                mediaRef.current?.removeEventListener('leavepictureinpicture', leavePip)
            }
        }
    }, [])

    useEffect(() => {
        if (!mediaRef.current) return

        const handleLoadedMetadata = () => {
            if (mediaRef.current && mediaRef.current.videoHeight) {
                const aspectRatio = mediaRef.current.videoWidth / mediaRef.current.videoHeight
                rootRef.current?.style.setProperty('--aspect-ratio', String(aspectRatio))
                if (onUpdate) onUpdate({ ...modelValue, aspectRatio })
            }
        }

        mediaRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)

        setMuted(mediaRef.current.muted)

        if (modelValue.direction === 'up') mountUpstream()
        else mountDownstream()

        return () => {
            mediaRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata)
        }
    }, [modelValue.id, modelValue.direction])

    return (
        <div
            class={classes('c-stream', {
                audio: modelValue.hasAudio && !modelValue.hasVideo,
                enlarged: modelValue.enlarged,
                loading: !modelValue.playing,
            })}
            onMouseOut={toggleStreamBar(false)}
            onMouseOver={toggleStreamBar(true)}
            ref={rootRef}
        >
            <video
                ref={mediaRef}
                autoplay={true}
                class={classes('media', { 'media-failed': mediaFailed, mirror: modelValue.mirror })}
                muted={modelValue.direction === 'up'}
                playsinline={true}
                onClick={(e) => {
                    e.stopPropagation()
                    toggleEnlarge()
                }}
            />

            {!modelValue.playing && (
                <div class="loading-container">
                    <Icon class="spinner" name="Spinner" />
                </div>
            )}

            {modelValue.playing && !modelValue.hasVideo && (
                <div class="media-container">
                    <Icon name="Logo" />
                </div>
            )}

            {stats.visible && <Reports description={modelValue} onClickStop={toggleStats} />}

            {controls && modelValue.playing && (
                <div class="user-info">
                    {audioEnabled && (
                        <SoundMeter
                            class="soundmeter"
                            orientation="vertical"
                            stream={stream}
                            stream-id={stream?.id}
                        />
                    )}

                    {audioEnabled && modelValue.direction === 'down' && (
                        <div class="volume-slider">
                            <FieldSlider
                                value={modelValue.volume?.value || 100}
                                onChange={handleVolumeChange}
                            />
                        </div>
                    )}

                    <div class={classes('user', { 'has-audio': audioEnabled })}>
                        {modelValue.username}
                    </div>
                </div>
            )}

            <div class={classes('stream-options', { active: bar.active })}>
                {pip.enabled && (
                    <Button
                        icon="Pip"
                        size="s"
                        tip={$t('stream.pip')}
                        variant="menu"
                        onClickStop={setPipMode}
                    />
                )}

                <Button
                    icon="Fullscreen"
                    size="s"
                    tip={$t('stream.fullscreen')}
                    variant="menu"
                    onClickStop={setFullscreen}
                />

                {hasSettings && (
                    <Button
                        active={stats.visible}
                        icon="Info"
                        size="s"
                        tip={$t('stream.info')}
                        variant="menu"
                        onClickStop={toggleStats}
                    />
                )}
            </div>
        </div>
    )
}
