import classnames from 'classnames'
import {ComponentChildren} from 'preact'
import './panel-menu.css'

interface PanelMenuProps {
    actions?: ComponentChildren
    collapsed: boolean
    footer?: ComponentChildren
    LinkComponent?: any
    logoHref?: string
    LogoIcon?: () => JSX.Element
    logoSrc?: string
    logoText?: string
    logoVersion?: string
    navigation?: ComponentChildren
    onCollapseChange?: (collapsed: boolean) => void
}

/**
 * PanelMenu - Generic left sidebar/panel component
 *
 * Provides a consistent panel layout with logo, navigation, actions, and footer sections.
 * Supports collapse/expand functionality.
 *
 * @example
 * <PanelMenu
 *   collapsed={false}
 *   logoSrc="/logo.svg"
 *   logoText="App Name"
 *   navigation={<nav>...</nav>}
 *   actions={<div>...</div>}
 *   footer={<div>...</div>}
 * />
 */
export const PanelMenu = ({
    actions,
    collapsed,
    footer,
    LinkComponent,
    logoHref,
    LogoIcon,
    logoSrc,
    logoText = '',
    logoVersion = '',
    navigation,
    onCollapseChange,
}: PanelMenuProps) => {
    const renderLogo = () => {
        const logoContent = (
            <>
                {logoSrc && <img src={logoSrc} alt={`${logoText} Logo`} />}
                {LogoIcon && (
                    <svg class="icon" viewBox="0 0 24 24" height="40" width="40">
                        <LogoIcon />
                    </svg>
                )}
                {logoText && (
                    <div class="l-name">
                        <span class="name logo-text">{logoText}</span>
                        {logoVersion && <span class="version">{logoVersion}</span>}
                    </div>
                )}
            </>
        )

        if (LinkComponent && logoHref) {
            return (
                <LinkComponent class="logo" href={logoHref}>
                    {logoContent}
                </LinkComponent>
            )
        }

        return <div class="logo">{logoContent}</div>
    }

    return (
        <aside class={classnames('c-panel-menu', 'fade-in', {collapsed})} style={{gridColumn: 'menu'}}>
            <header>
                {renderLogo()}
                {onCollapseChange && (
                    <button
                        class="collapse-toggle"
                        onClick={() => onCollapseChange(!collapsed)}
                        aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d={collapsed ? 'M10 8l-4-4v8l4-4z' : 'M6 8l4-4v8l-4-4z'} />
                        </svg>
                    </button>
                )}
            </header>
            <div class="content">
                {navigation && (
                    <div class="navigation" data-collapsed={collapsed}>
                        {navigation}
                    </div>
                )}
                {actions && (
                    <div class="actions" data-collapsed={collapsed}>
                        {actions}
                    </div>
                )}
                {footer && <div class="footer">{footer}</div>}
            </div>
        </aside>
    )
}
