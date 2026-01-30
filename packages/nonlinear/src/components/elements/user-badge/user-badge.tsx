import {getAvatarUrl} from '@garage44/common/lib/avatar'
import {Icon} from '@garage44/common/components'
import classnames from 'classnames'

interface UserBadgeProps {
    userId: string
    displayName?: string
    avatar?: string
    size?: 's' | 'd' | 'l'
}

export const UserBadge = ({userId, displayName, avatar, size = 'd'}: UserBadgeProps) => {
    const avatarFilename = avatar || 'placeholder-1.png'
    const avatarUrl = getAvatarUrl(avatarFilename, userId)

    return (
        <div class='c-user-badge'>
            <div class={classnames('c-user-avatar', `size-${size}`)}>
                <img alt={displayName || userId} class='avatar' src={avatarUrl} />
            </div>
            <span class='user-name'>{displayName || userId}</span>
        </div>
    )
}
