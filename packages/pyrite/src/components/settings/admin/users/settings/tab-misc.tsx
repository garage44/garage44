import {FieldCheckbox, FieldText} from '@garage44/common/components'
import {$s} from '@/app'
import {$t} from '@garage44/common/app'

export default function TabMisc() {
    return (
        <section class='c-users-settings-misc tab-content active'>
            <FieldText
                label={$t('user.settings.misc.username_label')}
                onChange={(value) => $s.admin.user.name = value}
                placeholder='...'
                value={$s.admin.user.name}
            />
            <FieldText
                label={$t('user.settings.misc.password_label')}
                onChange={(value) => $s.admin.user.password = value}
                placeholder='...'
                value={$s.admin.user.password}
            />
            <FieldCheckbox
                help={$t('user.settings.misc.role_admin_help')}
                label={$t('user.settings.misc.role_admin_label')}
                onChange={(value) => $s.admin.user.admin = value}
                value={$s.admin.user.admin}
            />
        </section>
    )
}
