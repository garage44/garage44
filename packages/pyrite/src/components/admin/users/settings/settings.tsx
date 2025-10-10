import {classes} from '@garage44/common/lib/utils'
import {Icon} from '@/components/elements'
import TabMisc from './tab-misc'
import TabPermissions from './tab-permissions'
import {Link, route} from 'preact-router'
import {$s, $t} from '@/app'
import {saveUser} from '@/models/user'

interface SettingsProps {
    userId?: string
    tabId?: string
}

export default function Settings({ userId, tabId = 'misc' }: SettingsProps) {
    const routeSettings = (tab: string) => {
        return `/admin/users/${$s.admin.user.id}?tab=${tab}`
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
                    <Icon class="icon icon-regular" name="User" />
                </div>
            </header>

            <ul class="tabs">
                <Link
                    class={classes('btn btn-menu', { active: tabId === 'misc' })}
                    href={routeSettings('misc')}
                >
                    <Icon class="icon-d" name="Pirate" />
                </Link>
                <Link
                    class={classes('btn btn-menu tab', {
                        active: tabId === 'permissions',
                        disabled: $s.admin.groups.length === 0,
                    })}
                    href={$s.admin.groups.length > 0 ? routeSettings('permissions') : '#'}
                >
                    <Icon class="icon-d" name="Operator" />
                </Link>
            </ul>

            <div class="tabs-content">
                {tabId === 'misc' && <TabMisc />}
                {tabId === 'permissions' && <TabPermissions />}

                <div class="actions">
                    <button class="btn btn-menu" onClick={saveUserAction}>
                        <Icon class="icon-d" name="Save" />
                    </button>
                </div>
            </div>
        </div>
    )
}
