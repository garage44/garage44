import {FieldSelect} from '@garage44/common/components'
import {$s} from '@/app'
import {$t} from '@garage44/common/app'

export default function TabMedia() {
    const acceptOptions = [
        {id: 'nothing', name: $t('ui.settings.media.accept.nothing_label')},
        {id: 'audio', name: $t('ui.settings.media.accept.audio_label')},
        {id: 'screenshare', name: $t('ui.settings.media.accept.screenshare_label')},
        {id: 'everything', name: $t('ui.settings.media.accept.everything_label')},
    ]

    const bandwidthOptions = [
        {id: 'lowest', name: $t('ui.settings.media.bandwidth.lowest_label')},
        {id: 'low', name: $t('ui.settings.media.bandwidth.low_label')},
        {id: 'normal', name: $t('ui.settings.media.bandwidth.normal_label')},
        {
            help: $t('ui.settings.media.bandwidth.unlimited_help'),
            id: 'unlimited',
            name: $t('ui.settings.media.bandwidth.unlimited_label'),
        },
    ]

    const resolutionOptions = [
        {id: 'default', name: $t('ui.settings.media.resolution.default_label')},
        {id: '720p', name: $t('ui.settings.media.resolution.720p_label')},
        {
            help: $t('ui.settings.media.resolution.1080p_help'),
            id: '1080p',
            name: $t('ui.settings.media.resolution.1080p_label'),
        },
    ]

    return (
        <section class="c-tab-media">
            <FieldSelect
                value={$s.media.accept}
                onChange={(value) => $s.media.accept = value}
                help={$t('ui.settings.media.accept_help')}
                label={$t('ui.settings.media.accept_label')}
                name="request"
                options={acceptOptions}
            />

            <FieldSelect
                value={$s.devices.cam.resolution}
                onChange={(value) => $s.devices.cam.resolution = value}
                help={$t('ui.settings.media.resolution_help')}
                label={$t('ui.settings.media.resolution_label')}
                name="resolution"
                options={resolutionOptions}
            />

            <FieldSelect
                value={$s.media.upstream}
                onChange={(value) => $s.media.upstream = value}
                help={$t('ui.settings.media.bandwidth_help')}
                label={$t('ui.settings.media.bandwidth_label')}
                name="send"
                options={bandwidthOptions}
            />
        </section>
    )
}
