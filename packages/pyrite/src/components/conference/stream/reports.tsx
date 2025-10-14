import {useEffect, useState, useMemo} from 'preact/hooks'
import {$t} from '@garage44/common/app'
import {connection} from '@/models/sfu/sfu'

interface ReportsProps {
    description: any // TODO: Define proper stream description type
    onClick?: () => void
}

export const Reports = ({ description, onClick }: ReportsProps) => {
    const [stats, setStats] = useState<Record<string, any>>({})
    const [glnStream, setGlnStream] = useState<any>(null)

    const hasAudioStats = useMemo(() => {
        if (description.settings && description.settings.audio && Object.keys(description.settings.audio).length) {
            return true
        }
        return false
    }, [description.settings])

    const hasVideoStats = useMemo(() => {
        if (description.settings && description.settings.video && Object.keys(description.settings.video).length) {
            return true
        }
        return false
    }, [description.settings])

    const onDownStats = () => {
        if (!glnStream) return
        glnStream.pc.getReceivers().forEach((r: any) => {
            let tid = r.track && r.track.id

            const streamStats = tid && glnStream.stats[tid]
            if (streamStats) {
                const filtered: Record<string, any> = {}
                for (const [categoryName, category] of Object.entries(streamStats)) {
                    filtered[categoryName] = {}
                    if (categoryName === 'track') {
                        for (const [statName, stat] of Object.entries(category as any)) {
                            if (statName === 'timestamp') {
                                continue
                            } else if (statName === 'totalAudioEnergy') {
                                filtered[categoryName]['Total Audio Energy'] = Number(stat).toFixed(2)
                            } else if (statName === 'audioEnergy') {
                                filtered[categoryName]['Audio Energy'] = Number(stat).toFixed(2)
                            }
                        }
                    }
                }
                setStats(filtered)
            }
        })
    }

    const onUpStats = () => {
        if (!glnStream) return
        glnStream.pc.getSenders().forEach((s: any) => {
            let tid = s.track && s.track.id
            const streamStats = glnStream.stats[tid]

            if (streamStats) {
                const filtered: Record<string, any> = {}
                for (const [categoryName, category] of Object.entries(streamStats)) {
                    filtered[categoryName] = {}
                    if (categoryName === 'outbound-rtp') {
                        for (const [statName, stat] of Object.entries(category as any)) {
                            if (statName === 'timestamp') {
                                continue
                            } else if (statName === 'rate') {
                                filtered[categoryName]['Data Rate'] = `${Math.round((stat as number) / 1000)} Kbps`
                            } else if (statName === 'bytesSent') {
                                filtered[categoryName]['Streamed'] = `${Math.round((stat as number) / 1000 / 1024)} Mb`
                            }
                        }
                    }
                }

                setStats(filtered)
            }
        })
    }

    useEffect(() => {
        if (!connection) return

        let stream = null
        if (connection.up[description.id]) {
            stream = connection.up[description.id]
            stream.onstats = onUpStats
        } else {
            stream = connection.down[description.id]
            stream.onstats = onDownStats
        }

        setGlnStream(stream)
        stream?.setStatsInterval(250)

        return () => {
            if (stream) {
                stream.onstats = null
            }
        }
    }, [description.id])

    return (
        <div class="c-stream-reports" onClick={onClick}>
            {!hasAudioStats && !hasVideoStats && (
                <div class="no-stats-available">
                    {$t('group.report.not_available')}
                </div>
            )}

            {hasVideoStats && (
                <div class="category">
                    <div class="title">
                        {$t('group.report.video')}
                    </div>
                    {Object.entries(description.settings.video).map(([statName, stat]) => (
                        <div key={statName} class="stat">
                            <div class="key">
                                {statName}
                            </div>
                            <div class="value">
                                {stat as any}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {hasAudioStats && (
                <div class="category">
                    <div class="title">
                        {$t('group.report.audio')}
                    </div>
                    {Object.entries(description.settings.audio).map(([statName, stat]) => (
                        <div key={statName} class="stat">
                            <div class="key">
                                {statName}
                            </div>
                            <div class="value">
                                {stat as any}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {Object.entries(stats).map(([categoryName, category]) => (
                <div key={categoryName} class="category">
                    <div class="title">
                        {categoryName}
                    </div>
                    {Object.entries(category).map(([statName, stat]) => (
                        <div key={statName} class="stat">
                            <div class="key">
                                {statName}
                            </div>
                            <div class="value">
                                {stat as any}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
