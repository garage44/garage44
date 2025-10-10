import {classes} from '@garage44/common/lib/utils'
import ContextMenu from '../context-menu/context-menu-users'
import {Icon} from '@/components/elements'
import {useMemo} from 'preact/hooks'
import {$s, $t} from '@/app'

export default function UsersContext() {
    const sortedUsers = useMemo(() => {
        const users = [...$s.users]
        users.sort(function(a, b) {
            if (!a.username || !b.username) return 0
            const aLowerName = a.username.toLowerCase()
            const bLowerName = b.username.toLowerCase()
            if (aLowerName < bLowerName) return -1
            else if (aLowerName > bLowerName) return +1
            else if (a.username < b.username) return -1
            else if (a.username > b.username) return +1
            return 0
        })
        return users
    }, [$s.users])

    const className = (user: any) => {
        const classes: any = {}
        if (user.data.raisehand) {
            classes.hand = true
        }
        if (user.data.availability) {
            if (user.data.availability.id === 'away') {
                classes.away = true
            } else if (user.data.availability.id === 'busy') {
                classes.busy = true
            }
        }

        return classes
    }

    return (
        <section class="c-users-context presence">
            {sortedUsers.map((user) => (
                <div key={user.id} class="user item">
                    <Icon
                        class={classes('icon item-icon icon-d', className(user))}
                        name={user.data.raisehand ? 'Hand' : 'User'}
                    />

                    <div class="name">
                        {user.username ? (
                            <div class="username">
                                {user.username === 'RECORDING' ? $t('user.recorder') : user.username}
                            </div>
                        ) : (
                            <div class="username">
                                {$t('user.anonymous')}
                            </div>
                        )}
                        {$s.users[0].id === user.id && (
                            <div class="username">
                                ({$t('user.you')})
                            </div>
                        )}

                        <div class="status">
                            {user.data.mic ? (
                                <Icon class="icon icon-s" name="Mic" />
                            ) : (
                                <Icon class="icon icon-s error" name="MicMute" />
                            )}
                        </div>

                        <div class="permissions">
                            {user.permissions.present && (
                                <span>
                                    <Icon class="icon icon-s" name="Present" />
                                </span>
                            )}
                            {user.permissions.op && (
                                <span>
                                    <Icon class="icon icon-s" name="Operator" />
                                </span>
                            )}
                        </div>
                    </div>
                    {user.username !== 'RECORDING' && <ContextMenu user={user} />}
                </div>
            ))}
        </section>
    )
}
