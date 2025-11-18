import {FieldCheckbox, FieldText} from '@garage44/common/components'
import {$s} from '@/app'
import {$t} from '@garage44/common/app'

export default function TabMisc() {
    return (
        <section class='c-users-settings-misc tab-content active'>
            <FieldText
                value={$s.admin.user.name}
                onChange={(value) => $s.admin.user.name = value}
                label={$t('user.settings.misc.username_label')}
                placeholder='...'
            />
            <FieldText
                value={$s.admin.user.password}
                onChange={(value) => $s.admin.user.password = value}
                label={$t('user.settings.misc.password_label')}
                placeholder='...'
            />
            <FieldCheckbox
                value={$s.admin.user.admin}
                onChange={(value) => $s.admin.user.admin = value}
                help={$t('user.settings.misc.role_admin_help')}
                label={$t('user.settings.misc.role_admin_label')}
            />
        </section>
    )
}
