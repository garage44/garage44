import classnames from 'classnames'
import {Icon} from '@garage44/common/components'
import Recordings from '@/components/settings/admin/group/recordings/recordings'
import Stats from '@/components/settings/admin/group/stats/stats'
import TabAccess from './tab-access'
import TabMisc from './tab-misc'
import TabPermissions from './tab-permissions'
import {Link, route} from 'preact-router'
import {$s} from '@/app'
import {saveGroup} from '@/models/group'

interface SettingsProps {
    groupId?: string
    path?: string
    tabId?: string
}

export default function Settings({groupId, path, tabId = 'misc'}: SettingsProps) {
    const routeSettings = (tab: string) => {
        return `/settings/groups/${groupId}?tab=${tab}`
    }

    const saveGroupAction = async () => {
        if (groupId) {
            const group = await saveGroup(groupId, $s.admin.group)
            route(`/settings/groups/${group._name}?tab=${tabId}`)
        }
    }

    return (
        <div class="c-admin-group content">
            <header>
                <div class="notice" />
                <div class="title">
                    {$s.admin.group && <span>{$s.admin.group._name}</span>}
                    <Icon class="icon icon-regular" name="group" />
                </div>
            </header>

            <ul class="tabs">
                <Link
                    class={classnames('btn btn-menu tab', {active: tabId === 'misc'})}
                    href={routeSettings('misc')}
                >
                    <Icon class="icon-d" name="pirate" />
                </Link>

                <Link
                    class={classnames('btn btn-menu tab', {active: tabId === 'access'})}
                    href={routeSettings('access')}
                >
                    <Icon class="icon-d" name="access" />
                </Link>

                <Link
                    class={classnames('btn btn-menu tab', {active: tabId === 'permissions'})}
                    href={routeSettings('permissions')}
                >
                    <Icon class="icon-d" name="operator" />
                </Link>

                <Link
                    class={classnames('btn btn-menu tab', {active: tabId === 'stats'})}
                    href={routeSettings('stats')}
                >
                    <Icon class="icon-d" name="stats" />
                </Link>

                <Link
                    class={classnames('btn btn-menu tab', {active: tabId === 'recordings'})}
                    href={routeSettings('recordings')}
                >
                    <Icon class="icon-d" name="record" />
                </Link>
            </ul>

            <div class="tabs-content">
                {tabId === 'misc' && <TabMisc />}
                {tabId === 'access' && <TabAccess />}
                {tabId === 'permissions' && <TabPermissions />}
                {tabId === 'stats' && <Stats groupId={groupId} />}
                {tabId === 'recordings' && <Recordings groupId={groupId} />}

                {path?.includes('/settings/groups') && (
                    <div class="actions">
                        <button class="btn btn-menu btn-save" onClick={saveGroupAction}>
                            <Icon class="icon-d" name="save" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
