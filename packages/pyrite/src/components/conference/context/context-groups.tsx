import classnames from 'classnames'
import {Icon} from '@garage44/common/components'
import {Link, route} from 'preact-router'
import {useEffect, useMemo, useRef} from 'preact/hooks'
import {$s} from '@/app'
import {$t, api, logger} from '@garage44/common/app'
import {currentGroup} from '@/models/group'

export default function GroupsContext() {
    const intervalRef = useRef<number | null>(null)

    const currentGroupData = useMemo(() => currentGroup(), [$s.sfu.channel.name, $s.chat.activeChannelSlug, $s.sfu.channels])

    const isListedGroup = useMemo(() => {
        const groupName = $s.sfu.channel.name
        return groupName ? !!$s.sfu.channels[groupName] : false
    }, [$s.sfu.channel.name, $s.sfu.channels])

    const groupLink = (groupId: string) => {
        if ($s.sfu.channel && $s.sfu.channel.name === groupId) {
            return '/'
        } else {
            return `/groups/${groupId}`
        }
    }

    const pollGroups = async () => {
        const groups = await api.get('/api/groups/public')

        // Store groups in sfu.channels (channel slug = group name)
        if (groups && Array.isArray(groups)) {
            for (const group of groups) {
                const channelSlug = group.name
                if (!$s.sfu.channels[channelSlug]) {
                    // Initialize channel entry if it doesn't exist
                    $s.sfu.channels[channelSlug] = {
                        audio: false,
                        connected: false,
                        video: false,
                    }
                }

                // Update group metadata in channel entry
                Object.assign($s.sfu.channels[channelSlug], {
                    locked: group.locked,
                    clientCount: group.clientCount,
                    comment: group.comment,
                    description: group.description,
                })

                // Update current group data if this is the active group
                if (group.name === $s.sfu.channel.name && currentGroupData) {
                    currentGroupData.locked = group.locked
                }
            }
        }
    }

    const setAutofocus = () => {
        $s.login.autofocus = true
    }

    const toggleUnlisted = () => {
        if (!$s.sfu.channel.name || isListedGroup) {
            $s.sfu.channel.name = $t('group.unlisted')
        } else if (!isListedGroup) {
            $s.sfu.channel.name = ''
        }
    }

    const updateRoute = () => {
        $s.login.autofocus = false

        if ($s.sfu.channel.name) {
            // Assume unlocked, when there are no public groups
            const channelData = $s.sfu.channels[$s.sfu.channel.name]
            $s.sfu.channel.locked = channelData?.locked || false

            // Update the group route when the user sets the channel name.
            route(`/groups/${$s.sfu.channel.name}`, true)
        } else {
            // By default show the splash page when emptying the channel input.
            route('/', true)
        }
    }

    // Watch channel name changes
    useEffect(() => {
        logger.debug(`updating group route: ${$s.sfu.channel.name}`)
        updateRoute()
    }, [$s.sfu.channel.name])

    // Setup polling
    useEffect(() => {
        intervalRef.current = setInterval(pollGroups, 3000) as any
        pollGroups()

        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    return (
        <section class={classnames('c-groups-context presence', {collapsed: $s.panels.context.collapsed})}>
            <div class="actions">
                <div
                    class={classnames('group item unlisted-group', {
                        active: window.location.pathname !== '/' && !isListedGroup,
                    })}
                    onClick={toggleUnlisted}
                >
                    <Icon class="icon item-icon icon-d" name="incognito" />
                    <div class="flex-column">
                        {(isListedGroup || !$s.sfu.channel.name) ? (
                            <div class="name">...</div>
                        ) : (
                            <div class="name">{$s.sfu.channel.name}</div>
                        )}
                    </div>
                </div>
            </div>
            {Object.entries($s.sfu.channels).map(([channelSlug, channelData]) => {
                // Only show channels that have group metadata (from public groups API)
                // A channel with group metadata has at least one of: description, comment, clientCount defined
                const hasGroupMetadata =
                    channelData.description !== undefined ||
                    channelData.comment !== undefined ||
                    channelData.clientCount !== undefined

                if (!hasGroupMetadata) {
                    return null
                }

                return (
                    <Link
                        key={channelSlug}
                        class={classnames('group item', {active: currentGroupData.name === channelSlug})}
                        href={groupLink(channelSlug)}
                        onClick={setAutofocus}
                    >
                        <Icon
                            class="icon item-icon icon-d"
                            name={channelData.locked ? 'GroupLocked' : 'Group'}
                        />

                        <div class="flex-column">
                            <div class="name">
                                {channelSlug}
                            </div>
                            {channelData.description && (
                                <div class="item-properties">
                                    {channelData.description}
                                </div>
                            )}
                        </div>

                        <div class={classnames('stats', {active: (channelData.clientCount || 0) > 0})}>
                            {channelData.clientCount || 0}
                            <Icon class="icon-d" name="user" />
                        </div>
                    </Link>
                )
            })}

            {Object.keys($s.sfu.channels).length === 0 && (
                <div class="group item no-presence">
                    <Icon class="item-icon icon-d" name="group" />
                    <div class="name">
                        {$t('group.no_groups_public')}
                    </div>
                </div>
            )}
        </section>
    )
}
