import {classes} from '@garage44/common/lib/utils'
import {Icon} from '@/components/elements'
import Recordings from '@/components/admin/group/recordings/recordings'
import Stats from '@/components/admin/group/stats/stats'
import TabAccess from './tab-access'
import TabMisc from './tab-misc'
import TabPermissions from './tab-permissions'
import {Link, route} from 'preact-router'
import {useMemo} from 'preact/hooks'
import {$s, $t} from '@/app'
import {saveGroup} from '@/models/group'

interface SettingsProps {
    groupId?: string
    tabId?: string
    path?: string
}

export default function Settings({ groupId, tabId = 'misc', path }: SettingsProps) {
    const routeSettings = (tab: string) => {
        return `/admin/groups/${groupId}?tab=${tab}`
    }

    const saveGroupAction = async () => {
        if (groupId) {
            const group = await saveGroup(groupId, $s.admin.group)
            route(`/admin/groups/${group._name}?tab=${tabId}`)
        }
    }

    return (
        <div class="c-admin-group content">
            <header>
                <div class="notice" />
                <div class="title">
                    {$s.admin.group && <span>{$s.admin.group._name}</span>}
                    <Icon class="icon icon-regular" name="Group" />
                </div>
            </header>

            <ul class="tabs">
                <Link
                    class={classes('btn btn-menu tab', { active: tabId === 'misc' })}
                    href={routeSettings('misc')}
                >
                    <Icon class="icon-d" name="Pirate" />
                </Link>

                <Link
                    class={classes('btn btn-menu tab', { active: tabId === 'access' })}
                    href={routeSettings('access')}
                >
                    <Icon class="icon-d" name="Access" />
                </Link>

                <Link
                    class={classes('btn btn-menu tab', { active: tabId === 'permissions' })}
                    href={routeSettings('permissions')}
                >
                    <Icon class="icon-d" name="Operator" />
                </Link>

                <Link
                    class={classes('btn btn-menu tab', { active: tabId === 'stats' })}
                    href={routeSettings('stats')}
                >
                    <Icon class="icon-d" name="Stats" />
                </Link>

                <Link
                    class={classes('btn btn-menu tab', { active: tabId === 'recordings' })}
                    href={routeSettings('recordings')}
                >
                    <Icon class="icon-d" name="Record" />
                </Link>
            </ul>

            <div class="tabs-content">
                {tabId === 'misc' && <TabMisc />}
                {tabId === 'access' && <TabAccess />}
                {tabId === 'permissions' && <TabPermissions />}
                {tabId === 'stats' && <Stats groupId={groupId} />}
                {tabId === 'recordings' && <Recordings groupId={groupId} />}

                {path?.includes('/admin/groups') && (
                    <div class="actions">
                        <button class="btn btn-menu btn-save" onClick={saveGroupAction}>
                            <Icon class="icon-d" name="Save" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
