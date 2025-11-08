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
            icon: 'Settings',
            id: 'profile',
            label: $t('ui.settings.profile.name'),
            tip: $t('ui.settings.profile.name'),
        },
        ...(showUserSettings ? [
            {
                component: <UsersManagement $t={$t} />,
                icon: 'account',
                id: 'users',
                label: $t('ui.settings.users.name'),
                tip: $t('ui.settings.users.name'),
            },
        ] : []),
        {
            component: <TabChannels />,
            icon: 'Channel',
            id: 'channels',
            label: $t('ui.settings.channels.name'),
            tip: $t('ui.settings.channels.name'),
        },
        {
            component: <TabDevices />,
            icon: 'Webcam',
            id: 'devices',
            label: $t('ui.settings.devices'),
            tip: $t('ui.settings.devices'),
        },
        {
            component: <TabMedia />,
            icon: 'Media',
            id: 'media',
            label: $t('ui.settings.media.name'),
            tip: $t('ui.settings.media.name'),
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
