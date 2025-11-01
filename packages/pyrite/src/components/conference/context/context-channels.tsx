import classnames from 'classnames'
import {Icon} from '@garage44/common/components'
import {getAvatarUrl} from '@garage44/common/lib/avatar'
import {Link, route} from 'preact-router'
import {useEffect, useMemo, useRef} from 'preact/hooks'
import {$s} from '@/app'
import {$t, ws, logger} from '@garage44/common/app'
import {loadGlobalUsers} from '@/models/chat'
import type {Channel} from '../../types.ts'
import './context-channels.css'

// Helper function outside component to avoid recreation
const channelLink = (channelSlug: string) => {
    return `/channels/${channelSlug}`
}

export default function ChannelsContext() {
    const intervalRef = useRef<number | null>(null)

    // DeepSignal is reactive - no need for useMemo dependencies
    const currentChannel = useMemo(() => {
        if (!$s.chat.activeChannelSlug) return null
        return $s.channels.find((c) => c.slug === $s.chat.activeChannelSlug)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const pollChannels = async () => {
        try {
            const response = await ws.get('/channels')
            if (response.success) {
                $s.channels = response.channels as Channel[]
                // Load all users globally after channels are loaded
                await loadGlobalUsers()
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

        // Get current pathname to avoid redirecting away from valid routes
        const currentPath = window.location.pathname

        // Don't redirect if we're on a protected route (settings, login, etc.)
        const protectedRoutes = ['/settings']
        if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
            return
        }

        if ($s.chat.activeChannelSlug) {
            // Update the channel route when the user sets the active channel
            route(`/channels/${$s.chat.activeChannelSlug}`, true)
        } else if (currentPath === '/' || currentPath.startsWith('/channels/')) {
            // Only redirect to home if we're already on home or a channel route
            // This prevents redirecting away from /settings or other routes
            route('/', true)
        }
    }

    // Watch active channel changes - but only update route when channel changes, not on initial mount
    useEffect(() => {
        // Don't call updateRoute on mount - let the router handle the current URL
        // Only update route when activeChannelSlug actually changes
        if ($s.chat.activeChannelSlug !== null && $s.chat.activeChannelSlug !== undefined) {
            logger.debug(`updating channel route: ${$s.chat.activeChannelSlug}`)
            updateRoute()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
            <div class="channels-list">
                {$s.channels.map((channel) => {
                    const channelKey = channel.slug
                    const channelData = $s.chat.channels[channelKey]
                    const unreadCount = channelData?.unread || 0
                    const hasUnread = unreadCount > 0

                    return (
                        <Link
                            key={channel.id}
                            class={classnames('channel item', {
                                active: currentChannel?.slug === channel.slug,
                                'has-unread': hasUnread,
                            })}
                            href={channelLink(channel.slug)}
                            onClick={() => {
                                $s.chat.activeChannelSlug = channel.slug
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
            </div>

            {/* People List Section */}
            <div class="people-section">
                <div class="people-header">
                    <span class="people-title">People</span>
                </div>
                <div class="people-list">
                    {(() => {
                        // Get all chat users from global users map
                        const chatUsers = $s.chat.users ? Object.entries($s.chat.users) : []

                        if (chatUsers.length === 0) {
                            return (
                                <div class="person item no-presence">
                                    <span class="person-name">No users found</span>
                                </div>
                            )
                        }

                        return chatUsers.map(([userId, userInfo]) => {
                            const avatarUrl = getAvatarUrl(userInfo.avatar, userId)
                            const isCurrentUser = $s.profile.id === userId

                            return <div key={userId} class="person item">
                                <img src={avatarUrl} alt={userInfo.username} class="person-avatar" />
                                <span class="person-name">
                                    {userInfo.username || $t('user.anonymous')}
                                    {isCurrentUser && (
                                        <span class="you-label"> ({$t('user.you')})</span>
                                    )}
                                </span>
                            </div>
                        })
                    })()}
                </div>
            </div>
        </section>
    )
}
