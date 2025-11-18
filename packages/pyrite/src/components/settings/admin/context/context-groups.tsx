import classnames from 'classnames'
import {Icon} from '@garage44/common/components'
import {Link, route} from 'preact-router'
import {useMemo, useEffect} from 'preact/hooks'
import {$t, api, notifier} from '@garage44/common/app'
import {$s} from '@/app'
import {saveGroup} from '@/models/group'

interface ContextGroupsProps {
    groupId?: string
    path?: string
}

export default function ContextGroups({groupId, path}: ContextGroupsProps) {
    const deletionGroups = useMemo(() => {
return $s.admin.groups.filter((i) => i._delete)
}, [$s.admin.groups])

    const orderedGroups = useMemo(() => {
        const groups = $s.admin.groups
            .filter((g) => g.public).concat($s.admin.groups.filter((g) => !g.public))
        return groups.sort((a, b) => {
            if (a._name < b._name) return -1
            if (a._name > b._name) return 1
            return 0
        })
    }, [$s.admin.groups])

    const addGroup = async () => {
        const group = await api.get('/api/groups/template')
        $s.admin.groups.push(group)
        toggleSelection(group._name)
    }

    const deleteGroups = async () => {
        notifier.notify({level: 'info', message: $tc('deleting one group | deleting {count} groups', deletionGroups.length)})
        const deleteRequests = []
        for (const group of deletionGroups) {
            $s.admin.groups.splice($s.admin.groups.findIndex((i) => i._name === group._name), 1)
            if (!group._unsaved) {
deleteRequests.push(fetch(`/api/groups/${group._name}/delete`))
}
        }

        await Promise.all(deleteRequests)

        if (orderedGroups.length) {
            const groupId = orderedGroups[0]._name
            route(`/settings/groups/${groupId}/misc`)
        }
    }

    const groupLink = (groupId: string) => {if ($s.admin.group && $s.admin.group._name == groupId) {
return path || `/settings/groups/${groupId}/misc`
} else {
return `/settings/groups/${groupId}/misc`
}}

    const saveGroupAction = async () => {
        if (!$s.admin.group) return
        const groupId = $s.admin.group._name
        const group = await saveGroup(groupId, $s.admin.group)

        // Select the next unsaved group to speed up group creation.
        if ($s.admin.group._unsaved) {
            const nextGroupIndex = orderedGroups.findIndex((g) => g._unsaved)
            if (nextGroupIndex >= 0) {
toggleSelection(orderedGroups[nextGroupIndex]._name)
}
        } else {
            // Reload the group, which may have been renamed.
            route(`/admin/groups/${group._name}/misc`)
        }
    }

    const toggleMarkDelete = async () => {
        if (!$s.admin.group) return
        $s.admin.group._delete = !$s.admin.group._delete
        for (let group of $s.admin.groups) {if (group._name == $s.admin.group._name) {
group._delete = $s.admin.group._delete
}}

        const similarStateGroups = orderedGroups.filter((i) => i._delete !== $s.admin.group?._delete)
        if (similarStateGroups.length) {
toggleSelection(similarStateGroups[0]._name)
}
    }

    const toggleSelection = (groupId: string) => {
route(`/admin/groups/${groupId}/misc`)
}

    useEffect(() => {return () => {
$s.admin.group = null
}}, [])

    if (!($s.admin.authenticated && $s.admin.permission)) return null

    return (
        <section class='c-admin-groups-context presence'>
            <div class='actions'>
                <button class='btn' disabled={!$s.admin.group} onClick={toggleMarkDelete}>
                    <Icon
                        class='item-icon icon-d'
                        name='minus'
                    />
                </button>
                <button class='btn'>
                    <Icon
                        class='item-icon icon-d'
                        name='plus'
                        onClick={addGroup}
                    />
                </button>
                <button class='btn' disabled={!deletionGroups.length} onClick={deleteGroups}>
                    <Icon
                        class='icon-d'
                        name='trash'
                    />
                </button>
                <button class='btn' disabled={!$s.admin.group} onClick={saveGroupAction}>
                    <Icon class='icon-d' name='save' />
                </button>
            </div>

            {orderedGroups.map((group) => (
                <Link
                    key={group._name}
                    class={classnames('group item', {active: groupId === group._name})}
                    href={groupLink(group._name)}
                >
                    <Icon
                        class={classnames('item-icon icon-d', {
                            delete: group._delete,
                            unsaved: group._unsaved,
                        })}
                        name={group._delete ? 'Trash' : 'Group'}
                    />

                    <div class='flex-column'>
                        <div class='name'>
                            {group._name}
                        </div>
                        <div class='item-properties'>
                            <Icon
                                class='icon-xs'
                                name={group.public ? 'Eye' : 'EyeClosed'}
                            />
                            <Icon
                                class='icon-xs'
                                name={group.locked ? 'Lock' : 'Unlock'}
                            />
                        </div>
                    </div>
                </Link>
            ))}

            {!orderedGroups.length && (
                <div class='group item no-presence'>
                    <Icon class='item-icon icon-d' name='group' />
                    <div class='name'>
                        {$t('group.no_groups')}
                    </div>
                </div>
            )}
        </section>
    )
}
