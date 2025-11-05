import {useMemo} from 'preact/hooks'
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

export default function Settings({ tabId }: SettingsProps) {
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
            id: 'profile',
            label: $t('ui.settings.profile.name'),
            icon: 'Settings',
            tip: $t('ui.settings.profile.name'),
            component: <Profile />,
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
            id: 'channels',
            label: $t('ui.settings.channels.name'),
            icon: 'Channel',
            tip: $t('ui.settings.channels.name'),
            component: <TabChannels />,
        },
        {
            id: 'devices',
            label: $t('ui.settings.devices'),
            icon: 'Webcam',
            tip: $t('ui.settings.devices'),
            component: <TabDevices />,
        },
        {
            id: 'media',
            label: $t('ui.settings.media.name'),
            icon: 'Media',
            tip: $t('ui.settings.media.name'),
            component: <TabMedia />,
        },
    ]

    return (
        <CommonSettings
            title={$t('ui.settings.name')}
            icon="settings"
            tabs={tabs}
            activeTabId={tabId}
            defaultTab="profile"
            getRoute={getRoute}
            onSave={saveSettings}
        />
    )
}
