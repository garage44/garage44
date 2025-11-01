import {$s} from '@/app'
import {$t, api, notifier} from '@garage44/common/app'

export function currentGroup() {
    // Use channel slug to find group data from sfu.channels
    // Channel slug maps 1:1 to Galene group name
    const channelSlug = $s.chat.activeChannelSlug || $s.sfu.channel.name
    const channelData = channelSlug ? $s.sfu.channels[channelSlug] : null
    
    // If channel data exists, merge with channel state
    if (channelData) {
        return {
            ...$s.sfu.channel,
            locked: channelData.locked ?? $s.sfu.channel.locked,
            clientCount: channelData.clientCount,
            comment: channelData.comment ?? $s.sfu.channel.comment,
        }
    }
    
    // Assume hidden group; use selected channel fields as placeholders.
    return $s.sfu.channel
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
