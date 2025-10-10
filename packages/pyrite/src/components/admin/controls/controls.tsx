import {Button} from '@/components/elements'
import {useMemo} from 'preact/hooks'
import {route} from 'preact-router'
import {$s, $t, api, store} from '@/app'

interface AdminControlsProps {
    path?: string
}

export default function AdminControls({ path }: AdminControlsProps) {
    const groupRoute = useMemo(() => {
        if ($s.admin.group) {
            return `/admin/groups/${$s.admin.group._name}/misc`
        } else if ($s.groups.length) {
            return `/admin/groups/${$s.groups[0].name}/misc`
        } else {
            return '/admin/groups/misc'
        }
    }, [$s.admin.group, $s.groups])

    const userRoute = useMemo(() => {
        if ($s.admin.user) {
            return `/admin/users/${$s.admin.user.id}/misc`
        } else {
            return '/admin/users'
        }
    }, [$s.admin.user])

    const logout = async () => {
        const context = await api.get('/api/logout')
        Object.assign($s.admin, context)
        route('/admin/login')
    }

    const toggleCollapse = () => {
        $s.panels.context.collapsed = !$s.panels.context.collapsed
        store.save()
    }

    return (
        <div class="c-admin-controls">
            <div class="navigational-controls">
                <Button
                    active={path?.includes('/admin/groups')}
                    icon="Group"
                    route={groupRoute}
                    tip={$t('group.groups')}
                    variant="menu"
                />

                <Button
                    active={path?.includes('/admin/users')}
                    icon="User"
                    route={userRoute}
                    tip={$t('user.users')}
                    variant="menu"
                />

                {($s.admin.authenticated && $s.admin.permission) && (
                    <Button
                        icon="Logout"
                        tip={$t('user.action.logout')}
                        variant="menu"
                        onClick={logout}
                    />
                )}
            </div>

            {$s.env.layout === 'desktop' && (
                <Button
                    icon="ViewList"
                    tip={$s.panels.context.collapsed ? $t('ui.panel.expand') : $t('ui.panel.collapse')}
                    variant="toggle"
                    onClick={toggleCollapse}
                />
            )}
        </div>
    )
}
