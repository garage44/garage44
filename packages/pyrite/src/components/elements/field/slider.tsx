import classnames from 'classnames'
import {Icon} from '@/components/elements'
import {useState, useRef, useEffect, useMemo} from 'preact/hooks'

interface SliderValue {
    value: number
    locked?: boolean | null
}

interface FieldSliderProps {
    value: SliderValue
    onChange: (value: SliderValue) => void
}

export default function FieldSlider({ value, onChange }: FieldSliderProps) {
    const [down, setDown] = useState(false)
    const trackRef = useRef<HTMLDivElement>(null)
    const thumbRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<number | null>(null)

    const [thumb, setThumb] = useState({ height: 0, width: 0, y: 0 })
    const [track, setTrack] = useState({ height: 0, y: 0 })
    const [dragY, setDragY] = useState<number | null>(null)

    const marginTop = useMemo(() => {
        const thumbY = track.height - (track.height) * (value.value / 100) - thumb.height
        if (thumbY > track.height) {
            return track.height - thumb.height
        } else if (thumbY - thumb.height < 0) {
            return 0
        } else {
            return thumbY
        }
    }, [track.height, value.value, thumb.height])

    const positionToValue = useMemo(() => {
        return 100 - Math.trunc((thumb.y / track.height) * 100)
    }, [thumb.y, track.height])

    const onClick = (doubleClick: boolean) => {
        // Locked feature is disabled:
        if (value.locked === null) return

        if (doubleClick) {
            // Simulate double-click in order to toggle locking a channel.
            if (!timeoutRef.current) {
                timeoutRef.current = setTimeout(() => { timeoutRef.current = null }, 500) as any
            } else {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
                onChange({
                    locked: !value.locked,
                    value: value.value,
                })
            }
        } else {
            onChange({
                locked: !value.locked,
                value: value.value,
            })
        }
    }

    const setPosition = (pageY: number) => {
        if (
            pageY >= track.y + thumb.height &&
            pageY <= (track.y + track.height - thumb.height)
        ) {
            setThumb(prev => ({ ...prev, y: pageY - track.y }))
        } else if (pageY < track.y + thumb.height) {
            setThumb(prev => ({ ...prev, y: 0 }))
        } else if (pageY > track.y + thumb.height) {
            setThumb(prev => ({ ...prev, y: track.height }))
        }
    }

    useEffect(() => {
        if (!trackRef.current || !thumbRef.current) return

        const trackEl = trackRef.current
        const thumbEl = thumbRef.current

        setTrack({
            height: trackEl.offsetHeight,
            y: trackEl.getBoundingClientRect().top + document.documentElement.scrollTop
        })

        setThumb(prev => ({
            ...prev,
            height: thumbEl.offsetHeight,
            width: thumbEl.offsetWidth
        }))

        const handleMouseDown = (e: MouseEvent) => {
            document.body.style.cursor = 'ns-resize'
            setDragY(e.pageY)
            setDown(true)
            setPosition(e.pageY)
            onChange({
                locked: value.locked ?? false,
                value: positionToValue,
            })
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!down) return
            const newTrackY = trackRef.current!.getBoundingClientRect().top + document.documentElement.scrollTop
            setTrack(prev => ({ ...prev, y: newTrackY }))
            setDragY(e.pageY)
            setPosition(e.pageY)
            onChange({
                locked: value.locked ?? false,
                value: positionToValue,
            })
        }

        const handleMouseUp = () => {
            document.body.style.cursor = 'default'
            setDown(false)
        }

        trackEl.addEventListener('mousedown', handleMouseDown)
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            trackEl.removeEventListener('mousedown', handleMouseDown)
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [down, positionToValue])

    return (
        <div class={classnames('c-field-slider', { active: down })}>
            {value.locked && (
                <Icon
                    class="icon icon-xs locked"
                    name="Lock"
                    onClick={() => onClick(false)}
                />
            )}

            <div ref={trackRef} class="track" onClick={() => onClick(true)}>
                <div ref={thumbRef} class="thumb" style={{ marginTop: `${marginTop}px` }} />
            </div>
        </div>
    )
}
