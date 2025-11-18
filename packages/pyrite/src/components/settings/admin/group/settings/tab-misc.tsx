import {FieldCheckbox, FieldMultiSelect, FieldNumber, FieldText} from '@garage44/common/components'
import {$t} from '@garage44/common/app'
import {$s} from '@/app'

export default function TabMisc() {
    const codecs = [
        {help: $t('group.settings.misc.codec_vp8_help'), id: 'vp8', name: 'VP8'},
        {help: $t('group.settings.misc.codec_vp9_help'), id: 'vp9', name: 'VP9'},
        {help: $t('group.settings.misc.codec_av1_help'), id: 'av1', name: 'AV1'},
        {help: $t('group.settings.misc.codec_h264_help'), id: 'h264', name: 'H264'},
        {help: $t('group.settings.misc.codec_opus_help'), id: 'opus', name: 'Opus'},
        {help: $t('group.settings.misc.codec_g722_help'), id: 'g722', name: 'G722'},
        {help: $t('group.settings.misc.codec_pcmu_help'), id: 'pcmu', name: 'PCMU'},
        {help: $t('group.settings.misc.codec_pcma_help'), id: 'pcma', name: 'PCMA'},
    ]

    return (
        <section class='c-admin-group-tab-misc tab-content active'>
            <FieldText
                help={$t('group.settings.misc.name_help')}
                label={$t('group.settings.misc.name_label')}
                onChange={(value) => $s.admin.group._newName = value}
                placeholder='...'
                value={$s.admin.group._newName}
            />
            <FieldText
                help={$t('group.settings.misc.description_help')}
                label={$t('group.settings.misc.description_label')}
                onChange={(value) => $s.admin.group.description = value}
                placeholder='...'
                value={$s.admin.group.description}
            />
            <FieldText
                help={$t('group.settings.misc.contact_help')}
                label={$t('group.settings.misc.contact_label')}
                onChange={(value) => $s.admin.group.contact = value}
                placeholder='...'
                value={$s.admin.group.contact}
            />
            <FieldText
                help={$t('group.settings.misc.comment_help')}
                label={$t('group.settings.misc.comment_label')}
                onChange={(value) => $s.admin.group.comment = value}
                placeholder='...'
                value={$s.admin.group.comment}
            />
            <FieldCheckbox
                help={$t('group.settings.misc.recording_help')}
                label={$t('group.settings.misc.recording_label')}
                onChange={(value) => $s.admin.group['allow-recording'] = value}
                value={$s.admin.group['allow-recording']}
            />
            <FieldMultiSelect
                help={$t('group.settings.misc.codec_help')}
                label={$t('group.settings.misc.codec_label')}
                onChange={(value) => $s.admin.group.codecs = value}
                options={codecs}
                value={$s.admin.group.codecs}
            />
            <FieldNumber
                help={$t('group.settings.misc.chat_history_help')}
                label={$t('group.settings.misc.chat_history_label')}
                onChange={(value) => $s.admin.group['max-history-age'] = value}
                value={$s.admin.group['max-history-age']}
            />
        </section>
    )
}
