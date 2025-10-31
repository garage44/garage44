import {Stream} from '../stream/stream'
import {useMemo} from 'preact/hooks'
import {$s} from '@/app'
import './video-strip.css'

interface VideoStripProps {
    streams?: any[]
}

/**
 * VideoStrip - Vertical video tiles strip component
 *
 * Displays video streams in a single vertical column layout.
 * Optimized for right-side panel display.
 */
export const VideoStrip = ({streams}: VideoStripProps) => {
    const sortedStreams = useMemo(() => {
        const streamList = streams || $s.streams
        return [...streamList].toSorted((a, b) => {
            if (a.username < b.username) return -1
            if (a.username > b.username) return 1
            return 0
        })
    }, [streams, $s.streams])

    if (!sortedStreams.length) {
        return null
    }

    return (
        <div class="c-video-strip">
            {sortedStreams.map((description, index) => (
                <div key={description.id || index} class="video-strip-item">
                    <Stream modelValue={sortedStreams[index]} />
                </div>
            ))}
        </div>
    )
}
