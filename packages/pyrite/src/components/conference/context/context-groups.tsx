import classnames from 'classnames'
import {Icon} from '@garage44/common/components'
import {Link, route} from 'preact-router'
import {useEffect, useMemo, useRef} from 'preact/hooks'
import {$s} from '@/app'
import {$t, api, logger} from '@garage44/common/app'
import {currentGroup} from '@/models/group'

export default function GroupsContext() {
    const intervalRef = useRef<number | null>(null)

    const currentGroupData = useMemo(() => currentGroup(), [$s.group.name, $s.groups])

    const isListedGroup = useMemo(() => {
        return !!$s.groups.find((i) => i.name === $s.group.name)
    }, [$s.group.name, $s.groups])

    const groupLink = (groupId: string) => {
        if ($s.group && $s.group.name === groupId) {
            return '/'
        } else {
            return `/groups/${groupId}`
        }
    }

    const pollGroups = async () => {
        const groups = await api.get('/api/groups/public')
        if (!$s.groups.length) {
            $s.groups = groups
        } else {
            for (const group of groups) {
                if (group.name === $s.group.name) {
                    currentGroupData.locked = group.locked
                }
                const _group = $s.groups.find((g) => g.name === group.name)
                if (_group) {
                    Object.assign(_group, {
                        clientCount: group.clientCount,
                        comment: group.comment,
                        locked: group.locked,
                    })
                } else {
                    $s.groups.push(group)
                }
            }
        }
    }

    const setAutofocus = () => {
        $s.login.autofocus = true
    }

    const toggleUnlisted = () => {
        if (!$s.group.name || isListedGroup) {
            $s.group.name = $t('group.unlisted')
        } else if (!isListedGroup) {
            $s.group.name = ''
        }
    }

    const updateRoute = () => {
        $s.login.autofocus = false

        if ($s.group.name) {
            // Assume unlocked, when there are no public groups
            $s.group.locked = $s.groups.find((i) => i.name === $s.group.name)?.locked || false

            // Update the group route when the user sets the group name.
            route(`/groups/${$s.group.name}`, true)
        } else {
            // By default show the splash page when emptying the group input.
            route('/', true)
        }
    }

    // Watch group name changes
    useEffect(() => {
        logger.debug(`updating group route: ${$s.group.name}`)
        updateRoute()
    }, [$s.group.name])

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
                        {(isListedGroup || !$s.group.name) ? (
                            <div class="name">...</div>
                        ) : (
                            <div class="name">{$s.group.name}</div>
                        )}
                    </div>
                </div>
            </div>
            {$s.groups.map((group) => (
                <Link
                    key={group.name}
                    class={classnames('group item', {active: currentGroupData.name === group.name})}
                    href={groupLink(group.name)}
                    onClick={setAutofocus}
                >
                    <Icon
                        class="icon item-icon icon-d"
                        name={group.locked ? 'GroupLocked' : 'Group'}
                    />

                    <div class="flex-column">
                        <div class="name">
                            {group.name}
                        </div>
                        {group.description && (
                            <div class="item-properties">
                                {group.description}
                            </div>
                        )}
                    </div>

                    <div class={classnames('stats', {active: group.clientCount > 0})}>
                        {group.clientCount}
                        <Icon class="icon-d" name="user" />
                    </div>
                </Link>
            ))}

            {!$s.groups.length && (
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
