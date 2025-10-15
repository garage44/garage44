import {FieldCheckbox, FieldNumber} from '@garage44/common/components'
import {$s} from '@/app'
import {$t} from '@garage44/common/app'

export default function TabAccess() {
    return (
        <section class="c-admin-group-tab-access tab-content active">
            <FieldCheckbox
                value={$s.admin.group.public}
                onChange={(value) => $s.admin.group.public = value}
                help={$t('group.settings.access.public_group_help')}
                label={$t('group.settings.access.public_group_label')}
            />
            <FieldCheckbox
                value={$s.admin.group['public-access']}
                onChange={(value) => $s.admin.group['public-access'] = value}
                help={$t('group.settings.access.guest_login_help')}
                label={$t('group.settings.access.guest_login_label')}
            />
            {$s.admin.group['public-access'] && (
                <FieldCheckbox
                    value={$s.admin.group['allow-anonymous']}
                    onChange={(value) => $s.admin.group['allow-anonymous'] = value}
                    help={$t('group.settings.access.anonymous_login_help')}
                    label={$t('group.settings.access.anonymous_login_label')}
                />
            )}

            <FieldCheckbox
                value={$s.admin.group['allow-subgroups']}
                onChange={(value) => $s.admin.group['allow-subgroups'] = value}
                help={$t('group.settings.access.subgroups_help')}
                label={$t('group.settings.access.subgroups_label')}
            />

            <FieldCheckbox
                value={$s.admin.group.autolock}
                onChange={(value) => $s.admin.group.autolock = value}
                help={$t('group.settings.access.autolock_help')}
                label={$t('group.settings.access.autolock_label')}
            />

            <FieldCheckbox
                value={$s.admin.group.autokick}
                onChange={(value) => $s.admin.group.autokick = value}
                help={$t('group.settings.access.autokick_help')}
                label={$t('group.settings.access.autokick_label')}
            />

            <FieldNumber
                value={$s.admin.group['max-clients']}
                onChange={(value) => $s.admin.group['max-clients'] = value}
                help={$t('group.settings.access.maxclient_help')}
                label={$t('group.settings.access.maxclient_label')}
                placeholder="..."
            />
        </section>
    )
}
