import {useEffect} from 'preact/hooks'
import {Icon} from '@garage44/common/components'
import {api, $t} from '@garage44/common/app'
import {$s} from '@/app'

export default function TabPermissions() {
    const categories = ['op', 'presenter', 'other']

    const loadGroups = async () => {
        $s.admin.groups = await api.get('/api/groups')
    }

    const toggleCategory = (category: string) => {
        const allSelected = !$s.admin.groups.some((i) => !$s.admin.user._permissions?.[category]?.includes(i.name))
        if (allSelected) {
            if (!$s.admin.user._permissions) $s.admin.user._permissions = {}
            $s.admin.user._permissions[category] = []
        } else {
            if (!$s.admin.user._permissions) $s.admin.user._permissions = {}
            $s.admin.user._permissions[category] = $s.admin.groups.map((i) => i.name)
        }
    }

    const toggleGroup = (groupname: string) => {
        if (!$s.admin.user._permissions) $s.admin.user._permissions = {}

        const allSelected = categories.every((c) => $s.admin.user._permissions?.[c]?.includes(groupname))
        if (allSelected) {
            for (const category of categories) {
                if (!$s.admin.user._permissions[category]) $s.admin.user._permissions[category] = []
                const groupIndex = $s.admin.user._permissions[category].indexOf(groupname)
                if (groupIndex > -1) {
                    $s.admin.user._permissions[category].splice(groupIndex, 1)
                }
            }
        } else {
            for (const category of categories) {
                if (!$s.admin.user._permissions[category]) $s.admin.user._permissions[category] = []
                if (!$s.admin.user._permissions[category].includes(groupname)) {
                    $s.admin.user._permissions[category].push(groupname)
                }
            }
        }
    }

    const isChecked = (category: string, groupname: string) => {
        return $s.admin.user._permissions?.[category]?.includes(groupname) || false
    }

    const handleCheckboxChange = (category: string, groupname: string, checked: boolean) => {
        if (!$s.admin.user._permissions) $s.admin.user._permissions = {}
        if (!$s.admin.user._permissions[category]) $s.admin.user._permissions[category] = []

        if (checked) {
            if (!$s.admin.user._permissions[category].includes(groupname)) {
                $s.admin.user._permissions[category].push(groupname)
            }
        } else {
            const index = $s.admin.user._permissions[category].indexOf(groupname)
            if (index > -1) {
                $s.admin.user._permissions[category].splice(index, 1)
            }
        }
    }

    useEffect(() => {
        if ($s.admin.authenticated && $s.admin.permission) {
            loadGroups()
        }
    }, [])

    return (
        <section class="c-users-settings-permissions tab-content permissions active">
            <div class="permission-group">
                <div class="group-name" />
                <div class="categories">
                    <div
                        class="category"
                        onClick={() => toggleCategory('op')}
                        onKeyPress={(e) => e.key === 'Enter' && toggleCategory('op')}
                        role="button"
                        tabIndex={0}
                    >
                        <Icon class="icon-d" name="operator" tip={$t('group.settings.permission.operator')} />
                    </div>
                    <div
                        class="category"
                        onClick={() => toggleCategory('presenter')}
                        onKeyPress={(e) => e.key === 'Enter' && toggleCategory('presenter')}
                        role="button"
                        tabIndex={0}
                    >
                        <Icon class="icon-d" name="present" tip={$t('group.settings.permission.presenter')} />
                    </div>
                    <div
                        class="category"
                        onClick={() => toggleCategory('other')}
                        onKeyPress={(e) => e.key === 'Enter' && toggleCategory('other')}
                        role="button"
                        tabIndex={0}
                    >
                        <Icon class="icon-d" name="otherpermissions" tip={$t('group.settings.permission.misc')} />
                    </div>
                </div>
            </div>

            {$s.admin.groups.map((group) => (
                <div key={group.name} class="permission-group item">
                    <div
                        class="group-name"
                        onClick={() => toggleGroup(group.name)}
                        onKeyPress={(e) => e.key === 'Enter' && toggleGroup(group.name)}
                        role="button"
                        tabIndex={0}
                    >
                        {group.name}
                    </div>

                    <div class="categories">
                        {categories.map((category) => (
                            <div key={category} class="category">
                                <input
                                    type="checkbox"
                                    checked={isChecked(category, group.name)}
                                    onChange={(e) => handleCheckboxChange(category, group.name, (e.target as HTMLInputElement).checked)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    )
}
