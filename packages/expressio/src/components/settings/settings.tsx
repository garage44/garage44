import {useMemo} from 'preact/hooks'
import {getCurrentUrl} from 'preact-router'
import {$s} from '@/app'
import {$t, logger, store, notifier} from '@garage44/common/app'
import {Settings as CommonSettings} from '@garage44/common/components/ui/settings/settings'
import {Profile} from '@garage44/common/components/ui/settings/tabs/profile'
import {UsersMisc} from '@garage44/common/components/ui/settings/tabs/users-misc'
import {UsersPermissions} from '@garage44/common/components/ui/settings/tabs/users-permissions'
import TabWorkspaces from './tabs/workspaces'

interface SettingsProps {
    tabId?: string
}

export function Settings({ tabId }: SettingsProps) {
    // Extract tab from query params if not provided as prop
    const activeTabId = useMemo(() => {
        if (tabId) return tabId
        const url = getCurrentUrl()
        const match = url.match(/[?&]tab=([^&]+)/)
        return match ? match[1] : undefined
    }, [tabId])
    const saveSettings = async () => {
        store.save()
        notifier.notify({icon: 'Settings', level: 'info', message: $t('ui.settings.action.saved')})
    }

    const getRoute = (tabId: string) => {
        return `/settings?tab=${tabId}`
    }

    // Determine if user settings should be shown (admin only)
    const showUserSettings = $s.user?.admin

    const tabs = [
        {
            id: 'profile',
            label: $t('ui.settings.profile.name'),
            icon: 'Settings',
            tip: $t('ui.settings.profile.name'),
            component: <Profile />,
        },
        ...(showUserSettings ? [
            {
                id: 'users-misc',
                label: $t('ui.settings.users.misc.name'),
                icon: 'Pirate',
                tip: $t('ui.settings.users.misc.name'),
                component: (
                    <UsersMisc
                        user={$s.user}
                        onNameChange={(value) => {
                            if ($s.user) $s.user.name = value
                        }}
                        onPasswordChange={(value) => {
                            if ($s.user) $s.user.password = value
                        }}
                        onAdminChange={(value) => {
                            if ($s.user) $s.user.admin = value
                        }}
                        $t={$t}
                    />
                ),
            },
            {
                id: 'users-permissions',
                label: $t('ui.settings.users.permissions.name'),
                icon: 'Operator',
                tip: $t('ui.settings.users.permissions.name'),
                component: (
                    <UsersPermissions
                        user={$s.user}
                        groups={[]}
                        onPermissionsChange={(permissions) => {
                            if ($s.user) $s.user._permissions = permissions
                        }}
                        authenticated={!!$s.user?.authenticated}
                        hasPermission={!!$s.user?.admin}
                        $t={$t}
                    />
                ),
            },
        ] : []),
        {
            id: 'workspaces',
            label: $t('ui.settings.workspaces.name'),
            icon: 'Workspace',
            tip: $t('ui.settings.workspaces.name'),
            component: <TabWorkspaces />,
        },
    ]

    return (
        <CommonSettings
            title={$t('ui.settings.name')}
            icon="settings"
            tabs={tabs}
            activeTabId={activeTabId}
            defaultTab="profile"
            getRoute={getRoute}
            onSave={saveSettings}
        />
    )
}
