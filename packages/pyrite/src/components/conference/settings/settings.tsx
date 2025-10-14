import {Button, Icon} from '@/components/elements'
import TabDevices from './tab-devices'
import TabMedia from './tab-media'
import TabMisc from './tab-misc'
import {useMemo} from 'preact/hooks'
import {$s} from '@/app'
import {$t, logger, store, notifier} from '@garage44/common/app'
// import {setLanguage} from '@garage44/common/app'

interface SettingsProps {
    tabId?: string
}

export default function Settings({ tabId }: SettingsProps) {
    const settingsRoute = useMemo(() => {
        if ($s.group.connected) {
            return `/groups/${$s.group.name}/settings`
        } else {
            return '/settings'
        }
    }, [$s.group.connected, $s.group.name])

    const saveSettings = async () => {
        // await setLanguage($s.language.id)
        logger.debug(`settings language to ${$s.language.id}`)
        store.save()
        notifier.notify({icon: 'Settings', level: 'info', message: $t('ui.settings.action.saved')})
    }

    return (
        <div class="c-settings content">
            <header>
                <div class="notice" />
                <div class="title">
                    <span>{$t('ui.settings.name')}</span>
                    <Icon class="item-icon icon-regular" name="Settings" />
                </div>
            </header>
            <div class="tabs">
                <Button
                    active={tabId === 'misc'}
                    icon="Pirate"
                    route={`${settingsRoute}/misc`}
                    tip={$t('ui.settings.misc.name')}
                    variant="menu"
                />

                <Button
                    active={tabId === 'media'}
                    icon="Media"
                    route={`${settingsRoute}/media`}
                    tip={$t('ui.settings.media.name')}
                    variant="menu"
                />

                <Button
                    active={tabId === 'devices'}
                    icon="Webcam"
                    route={`${settingsRoute}/devices`}
                    tip={$t('ui.settings.devices')}
                    variant="menu"
                />
            </div>

            <div class="tabs-content">
                {tabId === 'devices' && <TabDevices />}
                {tabId === 'media' && <TabMedia />}
                {tabId === 'misc' && <TabMisc />}

                <div class="actions">
                    <Button
                        icon="Save"
                        tip={$t('ui.settings.action.save')}
                        variant="menu"
                        onClick={saveSettings}
                    />
                </div>
            </div>
        </div>
    )
}
