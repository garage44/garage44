import {useEffect} from 'preact/hooks'
import type {ComponentChildren} from 'preact'
import {$t} from '@/app'
import {store} from '@garage44/common/app'
import {Icon} from '@garage44/common/components'
import classnames from 'classnames'

interface AppLayoutProps {
    children: ComponentChildren
    context?: ComponentChildren
    menu?: ComponentChildren
}

/**
 * AppLayout - Generic application layout component
 *
 * Provides a consistent CSS Grid layout pattern with menu (left), content (center), and optional context (right).
 * Used across all Garage44 applications.
 *
 * @example
 * <AppLayout menu={<PanelMenu {...props} />} context={<PanelContext />}>
 *   <YourMainContent />
 * </AppLayout>
 */
export const AppLayout = ({children, context, menu}: AppLayoutProps) => {
    const isMobile = store.state.env?.layout === 'mobile'

    useEffect(() => {
        // On mobile, ensure menu starts collapsed (hidden) so hamburger button is visible
        if (isMobile && store.state.panels?.menu && !store.state.panels.menu.collapsed) {
            store.state.panels.menu.collapsed = true
            store.save()
        }
    }, [isMobile])

    const handleMobileMenuToggle = () => {
        if (store.state.panels?.menu) {
            store.state.panels.menu.collapsed = !store.state.panels.menu.collapsed
            store.save()
        }
    }

    const handleBackdropClick = () => {
        if (isMobile && store.state.panels?.menu && !store.state.panels.menu.collapsed) {
            store.state.panels.menu.collapsed = true
            store.save()
        }
    }

    // On mobile, always show a button:
    // - Hamburger button when menu is closed (collapsed)
    // - Close button when menu is open (not collapsed)
    const menuCollapsed = store.state.panels?.menu?.collapsed ?? true // Default to collapsed on mobile
    const showMobileToggle = isMobile && menuCollapsed
    const showMobileClose = isMobile && !menuCollapsed

    return (
        <div class="c-app-layout">
            <div style={{position: 'absolute', visibility: 'hidden'}}>{$t('direction_helper')}</div>
            {menu}
            {isMobile && !menuCollapsed && (
                <div class="c-panel-menu-backdrop" onClick={handleBackdropClick} aria-hidden="true" />
            )}
            <main class="content">
                {isMobile && (
                    <>
                        <button
                            class={classnames('c-mobile-menu-toggle', {
                                'is-visible': showMobileToggle,
                            })}
                            onClick={handleMobileMenuToggle}
                            aria-label="Open menu"
                        >
                            <Icon name="menu_hamburger" size="d" />
                        </button>
                        <button
                            class={classnames('c-mobile-menu-close', {
                                'is-visible': showMobileClose,
                            })}
                            onClick={handleMobileMenuToggle}
                            aria-label="Close menu"
                        >
                            <Icon name="close_x" size="d" />
                        </button>
                    </>
                )}
                {children}
            </main>
            {context}
        </div>
    )
}
