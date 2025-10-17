import classnames from 'classnames'
import {ComponentChildren} from 'preact'

interface PanelContextProps {
    collapsed: boolean
    onCollapseChange?: (collapsed: boolean) => void
    logoHref?: string
    logoText?: string
    logoSrc?: string
    logoVersion?: string
    LogoIcon?: () => JSX.Element
    LinkComponent?: any
    navigation?: ComponentChildren
    actions?: ComponentChildren
    footer?: ComponentChildren
}

/**
 * PanelContext - Generic sidebar/panel component
 *
 * Provides a consistent panel layout with logo, navigation, actions, and footer sections.
 * Supports collapse/expand functionality.
 *
 * @example
 * <PanelContext
 *   collapsed={false}
 *   logoSrc="/logo.svg"
 *   logoText="App Name"
 *   navigation={<nav>...</nav>}
 *   actions={<div>...</div>}
 *   footer={<div>...</div>}
 * />
 */
export const PanelContext = ({
    collapsed,
    onCollapseChange,
    logoHref,
    logoText = '',
    logoSrc,
    logoVersion = '',
    LogoIcon,
    LinkComponent,
    navigation,
    actions,
    footer
}: PanelContextProps) => {
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
        <div class={classnames('c-panel-context', 'fade-in', {collapsed})}>
            <header>
                {renderLogo()}
                {onCollapseChange && (
                    <button
                        class="collapse-toggle"
                        onClick={() => onCollapseChange(!collapsed)}
                        aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d={collapsed ? "M10 8l-4-4v8l4-4z" : "M6 8l4-4v8l-4-4z"} />
                        </svg>
                    </button>
                )}
            </header>
            <div class="content">
                {navigation && <div class="navigation">{navigation}</div>}
                {actions && <div class="actions">{actions}</div>}
                {footer && <div class="footer">{footer}</div>}
            </div>
        </div>
    )
}
