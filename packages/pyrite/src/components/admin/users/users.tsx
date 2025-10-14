import {Splash} from '@/components/elements'
import {useEffect} from 'preact/hooks'
import {ComponentChildren} from 'preact'
import {$s} from '@/app'
import {logger, $t, api} from '@garage44/common/app'

interface UsersProps {
    userId?: string
    children?: ComponentChildren
}

/**
 * This is a container component that handles keeping
 * track of the current user, so its child components
 * don't have to.
 */
export const Users = ({ userId, children }: UsersProps) => {
    const loadUser = async (userId: string) => {
        logger.debug(`load user ${userId}`)
        const user = $s.admin.users.find((i) => i.id === parseInt(userId))
        if (user && (user._unsaved || user._delete)) {
            $s.admin.user = user
        } else {
            $s.admin.user = await api.get(`/api/users/${encodeURIComponent(userId)}`)
        }
    }

    const loadUsers = async () => {
        $s.admin.users = await api.get('/api/users')
    }

    // Initial load
    useEffect(() => {
        loadUsers().then(() => {
            if (userId) {
                loadUser(userId)
            }
        })
    }, [])

    // Watch userId changes
    useEffect(() => {
        if (!userId) {
            $s.admin.user = null
            return
        }
        loadUser(userId)
    }, [userId])

    if ($s.admin.user) {
        return <>{children}</>
    }

    return <Splash instruction={$t('user.action.select')} />
}
