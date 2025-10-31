import classnames from 'classnames'
import {Icon} from '@garage44/common/components'
import {Link, route} from 'preact-router'
import {useEffect, useMemo, useRef} from 'preact/hooks'
import {$s} from '@/app'
import {$t, ws, logger} from '@garage44/common/app'
import type {Channel} from '../../types.ts'
import './context-channels.css'

export default function ChannelsContext() {
    const intervalRef = useRef<number | null>(null)

    const currentChannel = useMemo(() => {
        if (!$s.chat.activeChannelId) return null
        return $s.channels.find((c) => c.id === $s.chat.activeChannelId)
    }, [$s.chat.activeChannelId, $s.channels])

    const channelLink = (channelId: number) => {
        return `/channels/${channelId}`
    }

    const pollChannels = async () => {
        try {
            const response = await ws.get('/channels')
            if (response.success) {
                $s.channels = response.channels as Channel[]
            }
        } catch (error) {
            logger.error('[ChannelsContext] Error polling channels:', error)
        }
    }

    const setAutofocus = () => {
        $s.login.autofocus = true
    }

    const updateRoute = () => {
        $s.login.autofocus = false

        if ($s.chat.activeChannelId) {
            // Update the channel route when the user sets the active channel
            route(`/channels/${$s.chat.activeChannelId}`, true)
        } else {
            // By default show the splash page when no channel is selected
            route('/', true)
        }
    }

    // Watch active channel changes
    useEffect(() => {
        logger.debug(`updating channel route: ${$s.chat.activeChannelId}`)
        updateRoute()
    }, [$s.chat.activeChannelId])

    // Setup polling
    useEffect(() => {
        intervalRef.current = setInterval(pollChannels, 3000) as any
        pollChannels()

        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    return (
        <section class={classnames('c-channels-context presence', {collapsed: $s.panels.context.collapsed})}>
            <div class="actions">
                <button
                    class={classnames('channel item unlisted-channel', {
                        active: window.location.pathname !== '/' && !currentChannel,
                    })}
                    onClick={() => {
                        if (!$s.chat.activeChannelId || currentChannel) {
                            $s.chat.activeChannelId = null
                        } else if (!currentChannel) {
                            $s.chat.activeChannelId = null
                        }
                    }}
                    aria-label="Toggle unlisted channel"
                >
                    <Icon class="icon item-icon icon-d" name="chat" />
                    <div class="flex-column">
                        <div class="name">...</div>
                    </div>
                </button>
            </div>
            {$s.channels.map((channel) => {
                const channelKey = channel.id.toString()
                const channelData = $s.chat.channels[channelKey]
                const unreadCount = channelData?.unread || 0
                const hasUnread = unreadCount > 0

                return (
                    <Link
                        key={channel.id}
                        class={classnames('channel item', {
                            active: currentChannel?.id === channel.id,
                            'has-unread': hasUnread,
                        })}
                        href={channelLink(channel.id)}
                        onClick={() => {
                            $s.chat.activeChannelId = channel.id
                            setAutofocus()
                        }}
                    >
                        <div class="flex-column">
                            <div class="name">
                                #{channel.name}
                            </div>
                            {channel.description && (
                                <div class="item-properties">
                                    {channel.description}
                                </div>
                            )}
                        </div>
                    </Link>
                )
            })}

            {!$s.channels.length && (
                <div class="channel item no-presence">
                    <div class="name">
                        {$t('channel.no_channels')}
                    </div>
                </div>
            )}

            {/* People List Section */}
            <div class="people-section">
                <div class="people-header">
                    <span class="people-title">People</span>
                </div>
                <div class="people-list">
                    {$s.users.map((user) => {
                        const isOnline = user.data?.availability?.id !== 'away' && user.data?.availability?.id !== 'busy'
                        const statusClass = classnames('status-indicator', {
                            away: user.data?.availability?.id === 'away',
                            busy: user.data?.availability?.id === 'busy',
                            online: isOnline,
                        })

                        return (
                            <div key={user.id} class="person item">
                                <span class={statusClass}></span>
                                <span class="person-name">
                                    {user.username || $t('user.anonymous')}
                                    {$s.users[0]?.id === user.id && (
                                        <span class="you-label"> ({$t('user.you')})</span>
                                    )}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
