import {Button} from '@garage44/common/components'
import {useMemo} from 'preact/hooks'
import {route} from 'preact-router'
import {$s} from '@/app'
import {$t, api, store} from '@garage44/common/app'

interface AdminControlsProps {
    path?: string
}

export default function AdminControls({path}: AdminControlsProps) {
    const groupRoute = useMemo(() => {
        if ($s.admin.group) {
return `/settings/groups/${$s.admin.group._name}/misc`
} else {
            // Use first channel from sfu.channels that has metadata
            const firstChannel = Object.entries($s.sfu.channels).find(([_, data]) => data.description || data.comment || data.clientCount !== undefined)
            if (firstChannel) {
return `/settings/groups/${firstChannel[0]}/misc`
} else {
return '/settings/groups/misc'
}
        }
    }, [$s.admin.group, $s.sfu.channels])

    const userRoute = useMemo(() => {if ($s.admin.user) {
return `/settings/users/${$s.admin.user.id}/misc`
} else {
return '/settings/users'
}}, [$s.admin.user])

    const logout = async () => {
        const context = await api.get('/api/logout')
        Object.assign($s.admin, context)
        // Clear stored credentials
        $s.profile.username = ''
        $s.profile.password = ''
        store.save()
        route('/')
    }

    const toggleCollapse = () => {
        $s.panels.context.collapsed = !$s.panels.context.collapsed
        store.save()
    }

    return (
        <div class='c-admin-controls'>
            <div class='navigational-controls'>
                <Button
                    active={path?.includes('/settings/groups')}
                    icon='Group'
                    route={groupRoute}
                    tip={$t('group.groups')}
                    variant='menu'
                />

                <Button
                    active={path?.includes('/settings/users')}
                    icon='User'
                    route={userRoute}
                    tip={$t('user.users')}
                    variant='menu'
                />

                {($s.admin.authenticated && $s.admin.permission) && (
                    <Button
                        icon='Logout'
                        tip={$t('user.action.logout')}
                        variant='menu'
                        onClick={logout}
                    />
                )}
            </div>

            <Button
                icon='ViewList'
                tip={$s.panels.context.collapsed ? $t('ui.panel.expand') : $t('ui.panel.collapse')}
                variant='toggle'
                onClick={toggleCollapse}
            />
        </div>
    )
}
