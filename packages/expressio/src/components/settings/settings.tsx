import {useMemo} from 'preact/hooks'
import {getCurrentUrl} from 'preact-router'
import {$s, i18n} from '@/app'
import {store, notifier} from '@garage44/common/app'
import {$t} from '@garage44/expressio'
import {Settings as CommonSettings} from '@garage44/common/components/ui/settings/settings'
import {Profile} from '@garage44/common/components/ui/settings/tabs/profile'
import {UsersManagement} from '@garage44/common/components'
import TabWorkspaces from './tabs/workspaces'

interface SettingsProps {
    tabId?: string
}

const getRoute = (tabId: string) => {return `/settings?tab=${tabId}`}

export function Settings({tabId}: SettingsProps) {
    // Extract tab from query params if not provided as prop
    const activeTabId = useMemo(() => {
        if (tabId) return tabId
        const url = getCurrentUrl()
        const match = url.match(/[?&]tab=([^&]+)/)
        return match ? match[1] : undefined
    }, [tabId])
    const saveSettings = async () => {
        store.save()
        notifier.notify({icon: 'Settings', message: $t(i18n.ui.settings.action.saved), type: 'info'})
    }

    // Determine if user settings should be shown (admin only)
    const showUserSettings = $s.profile?.admin

    const tabs = [
        {
            component: <Profile />,
            icon: 'Settings',
            id: 'profile',
            label: $t(i18n.ui.settings.profile.name),
            tip: $t(i18n.ui.settings.profile.name),
        },
        ...(showUserSettings ? [
            {
                component: <UsersManagement $t={$t} />,
                icon: 'account',
                id: 'users',
                label: $t(i18n.ui.settings.users.name),
                tip: $t(i18n.ui.settings.users.name),
            },
        ] : []),
        {
            component: <TabWorkspaces />,
            icon: 'Workspace',
            id: 'workspaces',
            label: $t(i18n.ui.settings.workspaces.name),
            tip: $t(i18n.ui.settings.workspaces.name),
        },
    ]

    return (
        <CommonSettings
            title={$t(i18n.ui.settings.name)}
            icon='settings'
            tabs={tabs}
            activeTabId={activeTabId}
            defaultTab='profile'
            getRoute={getRoute}
            onSave={saveSettings}
        />
    )
}
