import {FieldCheckbox, FieldNumber} from '@garage44/common/components'
import {$s} from '@/app'
import {$t} from '@garage44/common/app'

export default function TabAccess() {
    return (
        <section class='c-admin-group-tab-access tab-content active'>
            <FieldCheckbox
                help={$t('group.settings.access.public_group_help')}
                label={$t('group.settings.access.public_group_label')}
                onChange={(value) => $s.admin.group.public = value}
                value={$s.admin.group.public}
            />
            <FieldCheckbox
                help={$t('group.settings.access.guest_login_help')}
                label={$t('group.settings.access.guest_login_label')}
                onChange={(value) => $s.admin.group['public-access'] = value}
                value={$s.admin.group['public-access']}
            />
            {$s.admin.group['public-access'] &&
                <FieldCheckbox
                    help={$t('group.settings.access.anonymous_login_help')}
                    label={$t('group.settings.access.anonymous_login_label')}
                    onChange={(value) => $s.admin.group['allow-anonymous'] = value}
                    value={$s.admin.group['allow-anonymous']}
                />}

            <FieldCheckbox
                help={$t('group.settings.access.subgroups_help')}
                label={$t('group.settings.access.subgroups_label')}
                onChange={(value) => $s.admin.group['allow-subgroups'] = value}
                value={$s.admin.group['allow-subgroups']}
            />

            <FieldCheckbox
                help={$t('group.settings.access.autolock_help')}
                label={$t('group.settings.access.autolock_label')}
                onChange={(value) => $s.admin.group.autolock = value}
                value={$s.admin.group.autolock}
            />

            <FieldCheckbox
                help={$t('group.settings.access.autokick_help')}
                label={$t('group.settings.access.autokick_label')}
                onChange={(value) => $s.admin.group.autokick = value}
                value={$s.admin.group.autokick}
            />

            <FieldNumber
                help={$t('group.settings.access.maxclient_help')}
                label={$t('group.settings.access.maxclient_label')}
                onChange={(value) => $s.admin.group['max-clients'] = value}
                placeholder='...'
                value={$s.admin.group['max-clients']}
            />
        </section>
    )
}
