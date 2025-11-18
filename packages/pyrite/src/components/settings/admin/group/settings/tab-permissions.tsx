import {Icon} from '@garage44/common/components'
import {useEffect} from 'preact/hooks'
import {$s} from '@/app'
import {api} from '@garage44/common/app'

export default function TabPermissions() {
    const categories = ['op', 'presenter', 'other']

    const loadGroups = async() => {
        $s.admin.groups = await api.get('/api/groups')
    }

    const toggleCategory = (category: string) => {
        const allSelected = !$s.admin.users.some((i) => !$s.admin.group._permissions[category].includes(i.name))
        if (allSelected) {
            $s.admin.group._permissions[category] = []
        } else {
            $s.admin.group._permissions[category] = $s.admin.users.map((i) => i.name)
        }
    }

    const toggleUser = (username: string) => {
        const allSelected = categories.every((c) => $s.admin.group._permissions[c].includes(username))
        if (allSelected) {
            for (const category of categories) {
                const userIndex = $s.admin.group._permissions[category].indexOf(username)
                $s.admin.group._permissions[category].splice(userIndex, 1)
            }
        } else {
            for (const category of categories) {
                if (!$s.admin.group._permissions[category].includes(username)) {
                    $s.admin.group._permissions[category].push(username)
                }
            }
        }
    }

    const isChecked = (category: string, username: string) => {
        return $s.admin.group._permissions[category]?.includes(username) || false
    }

    const handleCheckboxChange = (category: string, username: string, checked: boolean) => {
        if (checked) {
            if (!$s.admin.group._permissions[category].includes(username)) {
                $s.admin.group._permissions[category].push(username)
            }
        } else {
            const index = $s.admin.group._permissions[category].indexOf(username)
            if (index > -1) {
                $s.admin.group._permissions[category].splice(index, 1)
            }
        }
    }

    useEffect(() => {
        if ($s.admin.authenticated && $s.admin.permission) {
            loadGroups()
        }
    }, [])

    return (
        <section class='c-admin-group-tab-permissions tab-content permissions active'>
            <div class='permission-group'>
                <div class='group-name' />
                <div class='categories'>
                    <div class='category' onClick={() => toggleCategory('op')}>
                        <Icon class='icon-d' name='operator' />
                    </div>
                    <div class='category' onClick={() => toggleCategory('presenter')}>
                        <Icon class='icon-d' name='present' />
                    </div>
                    <div class='category' onClick={() => toggleCategory('other')}>
                        <Icon class='icon-d' name='otherpermissions' />
                    </div>
                </div>
            </div>

            {$s.admin.users.map((user) => <div class='permission-group item' key={user.name}>
                    <div class='group-name' onClick={() => toggleUser(user.name)}>
                        {user.name}
                    </div>

                    <div class='categories'>
                        {categories.map((category) => <div class='category' key={category}>
                                <input
                                    checked={isChecked(category, user.name)}
                                    onChange={(e) => handleCheckboxChange(
                                        category,
                                        user.name,
                                        (e.target as HTMLInputElement).checked,
                                    )}
                                    type='checkbox'
                                />
                        </div>)}
                    </div>
            </div>)}
        </section>
    )
}
