import {ComponentChildren} from 'preact'
import classnames from 'classnames'

interface SidebarNavItemProps {
    active?: boolean
    children: ComponentChildren
    icon?: string
    IconComponent?: any
    onClick?: () => void
}

interface SidebarProps {
    actions?: ComponentChildren
    children?: ComponentChildren
    logo?: ComponentChildren
    title?: string
}

/**
 * SidebarNavItem - Navigation item for Sidebar
 */
export const SidebarNavItem = ({
    active = false,
    children,
    icon,
    IconComponent,
    onClick,
}: SidebarNavItemProps) => {
    const Icon = IconComponent

    return (
        <button
            class={classnames('c-sidebar__nav-link', {active})}
            onClick={onClick}
        >
            {icon && Icon && <Icon name={icon} />}
            <span>{children}</span>
        </button>
    )
}

/**
 * Sidebar - Generic sidebar/navigation component
 *
 * Provides a consistent sidebar pattern for application navigation.
 * Flexible enough to support different navigation styles and branding.
 *
 * @example
 * <Sidebar
 *   logo={<img src="/logo.svg" />}
 *   title="My App"
 *   actions={<ThemeToggle />}
 * >
 *   <nav class="c-sidebar__nav-list">
 *     <SidebarNavItem active icon="home">Home</SidebarNavItem>
 *     <SidebarNavItem icon="settings">Settings</SidebarNavItem>
 *   </nav>
 * </Sidebar>
 */
export const Sidebar = ({
    actions,
    children,
    logo,
    title,
}: SidebarProps) => (
    <nav class="c-sidebar">
        <div class="c-sidebar__header">
            {logo && <div class="c-sidebar__logo">{logo}</div>}
            {title && <h1 class="c-sidebar__title">{title}</h1>}
            {actions && <div class="c-sidebar__actions">{actions}</div>}
        </div>
        <div class="c-sidebar__content">
            {children}
        </div>
    </nav>
)
