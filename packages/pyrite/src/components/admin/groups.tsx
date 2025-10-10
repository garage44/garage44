import {Splash} from '@/components/elements'
import {useEffect} from 'preact/hooks'
import {ComponentChildren} from 'preact'
import {$s, $t, api} from '@/app'
import {logger} from '@garage44/common/app'

interface GroupsProps {
    groupId?: string
    children?: ComponentChildren
}

/**
 * This is a container component that handles keeping
 * track of the current group, so its child components
 * don't have to.
 */
export const Groups = ({ groupId, children }: GroupsProps) => {
    const loadGroup = async (groupId: string) => {
        logger.debug(`load group ${groupId}`)
        let group = $s.admin.groups.find((i) => i._name === groupId)
        if (group && group._unsaved) {
            $s.admin.group = group
        } else {
            const apiGroup = await api.get(`/api/groups/${encodeURIComponent(groupId)}`)
            if (group) {
                // Don't update internal state properties.
                for (const key of Object.keys(group)) {
                    if (!key.startsWith('_')) group[key] = apiGroup[key]
                }
            } else {
                group = apiGroup
            }
        }
        $s.admin.group = group
    }

    // Initial load
    useEffect(() => {
        if (groupId) {
            loadGroup(groupId)
        }
    }, [])

    // Watch groupId changes
    useEffect(() => {
        if (!groupId) {
            $s.admin.group = null
            return
        }
        loadGroup(groupId)
    }, [groupId])

    if ($s.admin.group) {
        return <>{children}</>
    }

    return <Splash instruction={$t('group.action.select')} />
}
