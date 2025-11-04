import classnames from 'classnames'

import {Icon} from '@garage44/common/components'
import TabMisc from './tab-misc'
import TabPermissions from './tab-permissions'
import {Link, route} from 'preact-router'
import {$s} from '@/app'
import {$t} from '@garage44/common/app'
import {saveUser} from '@/models/user'

interface SettingsProps {
    userId?: string
    tabId?: string
}

export default function Settings({ userId, tabId = 'misc' }: SettingsProps) {
    const routeSettings = (tab: string) => {
        return `/settings/users/${$s.admin.user.id}?tab=${tab}`
    }

    const saveUserAction = async () => {
        if (userId) {
            await saveUser(parseInt(userId), $s.admin.user)
        }
    }

    if (!$s.admin.user) return null

    return (
        <div class="c-admin-user content">
            <header>
                <div class="notice" />
                <div class="title">
                    <span>{$s.admin.user.name}</span>
                    <Icon class="icon icon-regular" name="user" />
                </div>
            </header>

            <ul class="tabs">
                <Link
                    class={classnames('btn btn-menu', { active: tabId === 'misc' })}
                    href={routeSettings('misc')}
                >
                    <Icon class="icon-d" name="pirate" />
                </Link>
                <Link
                    class={classnames('btn btn-menu tab', {
                        active: tabId === 'permissions',
                        disabled: $s.admin.groups.length === 0,
                    })}
                    href={$s.admin.groups.length > 0 ? routeSettings('permissions') : '#'}
                >
                    <Icon class="icon-d" name="operator" />
                </Link>
            </ul>

            <div class="tabs-content">
                {tabId === 'misc' && <TabMisc />}
                {tabId === 'permissions' && <TabPermissions />}

                <div class="actions">
                    <button class="btn btn-menu" onClick={saveUserAction}>
                        <Icon class="icon-d" name="save" />
                    </button>
                </div>
            </div>
        </div>
    )
}
