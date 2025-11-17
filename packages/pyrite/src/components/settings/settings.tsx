import {useMemo} from 'preact/hooks'
import {getCurrentUrl} from 'preact-router'
import {$s} from '@/app'
import {$t, logger, store, notifier} from '@garage44/common/app'
import {Settings as CommonSettings} from '@garage44/common/components/ui/settings/settings'
import {Profile} from '@garage44/common/components/ui/settings/tabs/profile'
import {UsersManagement} from '@garage44/common/components'
import TabDevices from './tabs/devices'
import TabMedia from './tabs/media'
import TabChannels from './tabs/channels'

interface SettingsProps {
    tabId?: string
}

export default function Settings({tabId}: SettingsProps) {
    // Detect if we're on a users route and set active tab to 'users'
    const activeTabId = useMemo(() => {
        if (tabId) return tabId
        const url = getCurrentUrl()
        // If URL is /settings/users/new or /settings/users/:userId, show users tab
        if (url.startsWith('/settings/users')) {
            return 'users'
        }
        return undefined
    }, [tabId])
    const settingsRoute = useMemo(() => {
        if ($s.sfu.channel.connected) {
            return `/groups/${$s.sfu.channel.name}/settings`
        } else {
            return '/settings'
        }
    }, [$s.sfu.channel.connected, $s.sfu.channel.name])

    const saveSettings = async () => {
        logger.debug(`settings language to ${$s.language.id}`)
        store.save()
        notifier.notify({icon: 'Settings', level: 'info', message: $t('ui.settings.action.saved')})
    }

    const getRoute = (tabId: string) => {
        return `${settingsRoute}/${tabId}`
    }

    // Determine if user settings should be shown (admin only)
    const showUserSettings = $s.admin.authenticated && $s.admin.permission

    const tabs = [
        {
            component: <Profile />,
            icon: 'settings',
            id: 'profile',
            label: $t('ui.settings.profile.name') || 'Profile',
            tip: $t('ui.settings.profile.name') || 'Profile',
        },
        ...(showUserSettings ? [
            {
                component: <UsersManagement $t={$t} />,
                icon: 'user',
                id: 'users',
                label: $t('ui.settings.users.name') || 'Users',
                tip: $t('ui.settings.users.name') || 'Users',
            },
        ] : []),
        {
            component: <TabChannels />,
            icon: 'chat',
            id: 'channels',
            label: $t('ui.settings.channels.name') || 'Channels',
            tip: $t('ui.settings.channels.name') || 'Channels',
        },
        {
            component: <TabDevices />,
            icon: 'webcam',
            id: 'devices',
            label: $t('ui.settings.devices') || 'Devices',
            tip: $t('ui.settings.devices') || 'Devices',
        },
        {
            component: <TabMedia />,
            icon: 'media',
            id: 'media',
            label: $t('ui.settings.media.name') || 'Media',
            tip: $t('ui.settings.media.name') || 'Media',
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
            showSave={false}
        />
    )
}
