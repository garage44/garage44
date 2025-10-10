import {$s, notifier} from '@/app'
import {$t, api} from '@garage44/common/app'

export function currentGroup() {
    const currentGroup = $s.groups.find((i) => i.name === $s.group.name)
    // Assume hidden group; use selected group fields as placeholders.
    if (!currentGroup) {
        return $s.group
    }

    return currentGroup
}

export async function saveGroup(groupId, data) {
    const group = await api.post(`/api/groups/${encodeURIComponent(groupId)}`, data)

    if (group._name === group._newName) {
        notifier.notify({level: 'info', message: $t('group.action.saved', {group: group._name})})
        $s.admin.groups[$s.admin.groups.findIndex((g) => g._name === group._name)] = group
    } else {
        notifier.notify({
            level: 'info',
            message: $t('group.action.renamed', {
                newname: group._newName,
                oldname: group._name,
            }),
        })

        const groupIndex = $s.admin.groups.findIndex((g) => g._name === group._name)
        group._name = group._newName
        $s.admin.groups[groupIndex] = group
    }

    return group
}
