import {Icon} from '../icon/icon'
import {ContextMenu} from '../context-menu/context-menu'
import {ThemeToggle} from '../theme-toggle/theme-toggle'
import classnames from 'classnames'
import './user-menu.css'

interface UserMenuProps {
    className?: string
    collapsed?: boolean
    onLogout?: () => void
    user?: {
        profile?: {
            displayName?: string
            avatar?: string | null
        }
    }
}

/**
 * UserMenu - User menu with avatar icon and context menu
 * Contains theme toggle and logout options
 */
export const UserMenu = ({
    className = '',
    collapsed = false,
    onLogout,
    user,
}: UserMenuProps) => {
    const displayName = user?.profile?.displayName || 'User'
    const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const avatarContent = user?.profile?.avatar ? (
        <img alt={displayName} class="avatar-img" src={user.profile.avatar} />
    ) : (
        <div class="avatar-initials">{initials}</div>
    )

    return (
        <ContextMenu
            anchor={
                <div class={classnames('c-user-menu', {collapsed}, className)}>
                    {avatarContent}
                    {!collapsed && <span class="name">{displayName}</span>}
                </div>
            }
            className={className}
            position="top"
        >
            <div class="menu">
                {!collapsed && (
                    <div class="menu-header">
                        <div class="menu-avatar">{avatarContent}</div>
                        <div class="menu-name">{displayName}</div>
                    </div>
                )}
                <div class="menu-item theme">
                    <ThemeToggle />
                    <span>Theme</span>
                </div>
                {onLogout && (
                    <button class="menu-item" onClick={onLogout} type="button">
                        <Icon name="logout" type="info" />
                        <span>Logout</span>
                    </button>
                )}
            </div>
        </ContextMenu>
    )
}
