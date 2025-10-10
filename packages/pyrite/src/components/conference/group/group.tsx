import {Icon} from '@/components/elements'
import {Stream} from '../stream/stream'
import {useEffect, useRef, useMemo} from 'preact/hooks'
import {$s} from '@/app'

export const Group = () => {
    const viewRef = useRef<HTMLDivElement>(null)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)

    // Constants
    const aspectRatio = 4 / 3
    const margin = 16

    // Computed: sortedStreams
    const sortedStreams = useMemo(() => {
        return [...$s.streams].sort((a, b) => {
            if (a.username < b.username) return -1
            if (a.username > b.username) return 1
            return 0
        })
    }, [$s.streams])

    // Computed: streamsCount and streamsPlayingCount
    const streamsCount = $s.streams.length
    const streamsPlayingCount = useMemo(() => {
        return $s.streams.filter((s) => s.playing).length
    }, [$s.streams])

    /**
     * Optimal space algorithm from Anton Dosov:
     * https://dev.to/antondosov/building-a-video-gallery-just-like-in-zoom-4mam
     * Also, learned from this resource:
     * https://github.com/Alicunde/Videoconference-Dish-CSS-JS
     */
    const calcLayout = () => {
        if (!viewRef.current) return
        const containerWidth = viewRef.current.offsetWidth
        const containerHeight = viewRef.current.offsetHeight
        let layout = {area: 0, cols: 0, height: 0, rows: 0, width: 0}
        let height, width

        for (let cols = 1; cols <= $s.streams.length; cols++) {
            const rows = Math.ceil($s.streams.length / cols)
            const hScale = containerWidth / (cols * aspectRatio)
            const vScale = containerHeight / rows

            // Determine which axis is the constraint.
            if (hScale <= vScale) {
                width = Math.floor((containerWidth - margin) / cols) - margin
                height = Math.floor(width / aspectRatio) - margin
            } else {
                height = Math.floor((containerHeight - margin) / rows) - margin
                width = Math.floor(height * aspectRatio) - margin
            }

            const area = width * height
            if (area > layout.area) {
                layout = {area, cols, height, rows, width}
            }
        }

        viewRef.current.style.setProperty('--stream-width', `${layout.width}px`)
    }

    // Watch streamsCount and streamsPlayingCount
    useEffect(() => {
        requestAnimationFrame(calcLayout)
    }, [streamsCount, streamsPlayingCount])

    // Setup and cleanup
    useEffect(() => {
        if (!viewRef.current) return

        viewRef.current.style.setProperty('--stream-margin', `${margin}px`)

        resizeObserverRef.current = new ResizeObserver(() => {
            requestAnimationFrame(calcLayout)
        })

        requestAnimationFrame(calcLayout)
        resizeObserverRef.current.observe(viewRef.current)

        // Set active channel to main
        $s.chat.channel = 'main'

        // Cleanup
        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect()
            }
        }
    }, [])

    return (
        <div ref={viewRef} class="c-group">
            {sortedStreams.map((description, index) => (
                <Stream key={description.id || index} modelValue={sortedStreams[index]} />
            ))}

            {!$s.streams.length && <Icon class="icon logo-animated" name="Logo" />}
        </div>
    )
}
