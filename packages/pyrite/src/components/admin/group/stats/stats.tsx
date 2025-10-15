import {useEffect, useState} from 'preact/hooks'
import {Chart, Icon} from '@garage44/common/components'
import {api, logger} from '@garage44/common/app'
import {$t} from '@garage44/common/app'

interface StatsProps {
    groupId?: string
}

interface TrackStats {
    bitrate: number[]
    jitter: number[]
    loss: number[]
    maxBitrate: number[]
}

interface StreamStats {
    tracks: TrackStats[]
}

interface ClientStats {
    id: string
    collapsed: boolean
    up: StreamStats[]
}

interface Stats {
    clients: Record<string, ClientStats>
}

export default function Stats({ groupId }: StatsProps) {
    const [stats, setStats] = useState<Stats>({ clients: {} })
    const [statProps, setStatProps] = useState({
        bitrate: false,
        jitter: false,
        loss: false,
        maxBitrate: false,
    })
    const [intervalId, setIntervalId] = useState<number | null>(null)

    const statEnabled = (track: TrackStats, property: keyof TrackStats) => {
        // Already enabled; return quick
        if (statProps[property]) return true
        if (track[property].some((i) => i !== track[property][0])) return true
        return false
    }

    const loadStats = async () => {
        if (!groupId) return

        let initClient = false
        const apiStats = await api.get(`/api/dashboard/${groupId}`)

        if (!apiStats || !apiStats.clients) {
            setStats({ clients: {} })
            return
        }

        const clients = apiStats.clients.map((i: any) => i.id)
        const newStats = { ...stats }

        const removedClients = Object.keys(newStats.clients).filter((i) => !clients.includes(i))
        // A client was removed
        for (const clientId of removedClients) {
            logger.info(`remove client ${clientId}`)
            delete newStats.clients[clientId]
        }

        if (!Array.isArray(apiStats.clients)) {
            setStats(newStats)
            return
        }

        for (const client of apiStats.clients) {
            if (!client.up) continue

            if (!newStats.clients[client.id]) {
                newStats.clients[client.id] = {
                    ...client,
                    collapsed: true,
                }
                initClient = true
            }

            if (!newStats.clients[client.id].up || newStats.clients[client.id].up.length !== client.up.length) {
                newStats.clients[client.id].up = JSON.parse(JSON.stringify(client.up))
                initClient = true
            }

            for (const [streamIndex, stream] of client.up.entries()) {
                if (stream.tracks.length !== newStats.clients[client.id].up[streamIndex].tracks.length) {
                    newStats.clients[client.id].up[streamIndex].tracks = JSON.parse(JSON.stringify(stream.tracks))
                    initClient = true
                }

                for (const [trackIndex, track] of stream.tracks.entries()) {
                    const trackRef = newStats.clients[client.id].up[streamIndex].tracks
                    if (initClient) {
                        trackRef[trackIndex] = {
                            bitrate: [track.bitrate],
                            jitter: [track.jitter],
                            loss: [track.loss],
                            maxBitrate: [track.maxBitrate],
                        }
                    } else {
                        if (statEnabled(trackRef[trackIndex], 'bitrate')) setStatProps(prev => ({ ...prev, bitrate: true }))
                        trackRef[trackIndex].bitrate.push(track.bitrate)

                        if (statEnabled(trackRef[trackIndex], 'jitter')) setStatProps(prev => ({ ...prev, jitter: true }))
                        trackRef[trackIndex].jitter.push(track.jitter)

                        if (statEnabled(trackRef[trackIndex], 'loss')) setStatProps(prev => ({ ...prev, loss: true }))
                        trackRef[trackIndex].loss.push(track.loss)

                        if (statEnabled(trackRef[trackIndex], 'maxBitrate')) setStatProps(prev => ({ ...prev, maxBitrate: true }))
                        trackRef[trackIndex].maxBitrate.push(track.maxBitrate)
                    }
                }
            }
        }

        setStats(newStats)
    }

    const toggleCollapse = (clientId: string) => {
        setStats(prev => ({
            clients: {
                ...prev.clients,
                [clientId]: {
                    ...prev.clients[clientId],
                    collapsed: !prev.clients[clientId].collapsed,
                },
            },
        }))
    }

    useEffect(() => {
        loadStats()
        const id = setInterval(loadStats, 250) as unknown as number
        setIntervalId(id)

        return () => {
            clearInterval(id)
        }
    }, [groupId])

    const clientsArray = Object.values(stats.clients)

    if (clientsArray.length === 0) {
        return (
            <section class="c-admin-dashboard tab-content no-results">
                <Icon className="icon icon-l" name="stats" />
                <span>{$t('group.settings.statistic.no_connections')}</span>
            </section>
        )
    }

    return (
        <section class="c-admin-groups-stats tab-content active">
            {clientsArray.map((client) => (
                <div key={client.id} class="client">
                    <div
                        class={`client-header ${client.collapsed ? 'collapsed' : ''}`}
                        onClick={() => toggleCollapse(client.id)}
                        onKeyPress={(e) => e.key === 'Enter' && toggleCollapse(client.id)}
                        role="button"
                        tabIndex={0}
                    >
                        <Icon className="icon icon-d" name="stats" /> {client.id}
                    </div>
                    {!client.collapsed && client.up.map((stream, streamIdx) => (
                        <div key={streamIdx} class="stream">
                            {stream.tracks.map((track, trackIdx) => (
                                <div key={trackIdx} class="track">
                                    {statProps.bitrate && <Chart data={track.bitrate} name="bitrate" />}
                                    {statProps.jitter && <Chart data={track.jitter} name="jitter" />}
                                    {statProps.loss && <Chart data={track.loss} name="loss" />}
                                    {statProps.maxBitrate && <Chart data={track.maxBitrate} name="maxBitrate" />}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </section>
    )
}
