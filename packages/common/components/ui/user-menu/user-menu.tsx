import {ContextMenu} from '../context-menu/context-menu'
import {MenuItem} from '../menu-item/menu-item'
import {store} from '@garage44/common/app'
import classnames from 'classnames'
import './user-menu.css'

interface UserMenuProps {
    className?: string
    collapsed?: boolean
    onLogout?: () => void
    user?: {
        profile?: {
            avatar?: string | null
            displayName?: string
        }
    }
}

/**
 * UserMenu - User menu with avatar icon and context menu
 * Contains theme toggle and logout options
 */
const themes = ['light', 'dark', 'system'] as const

const cycleTheme = () => {
    const currentIndex = themes.indexOf(store.state.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    store.state.theme = themes[nextIndex]
}

const getThemeIcon = () => {
    if (store.state.theme === 'light') return 'sun'
    if (store.state.theme === 'dark') return 'moon'
    return 'system'
}

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
            {!collapsed && (
                <div class="menu-header">
                    <div class="menu-avatar">{avatarContent}</div>
                    <div class="menu-name">{displayName}</div>
                </div>
            )}
            <MenuItem
                collapsed={collapsed}
                icon={getThemeIcon()}
                iconType="info"
                onClick={cycleTheme}
                text={`Theme: ${store.state.theme}`}
            />
            {onLogout && (
                <MenuItem
                    collapsed={collapsed}
                    icon="logout"
                    iconType="info"
                    onClick={onLogout}
                    text="Logout"
                />
            )}
        </ContextMenu>
    )
}
