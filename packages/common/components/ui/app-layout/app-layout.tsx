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
    // Access store state directly - DeepSignal reactivity will trigger re-renders
    // Accessing store.state.env?.layout in render makes it reactive
    const isMobile = store.state.env?.layout === 'mobile'

    useEffect(() => {
        // On mobile, ensure menu starts collapsed (hidden) so hamburger button is visible
        if (isMobile && store.state.panels?.menu && !store.state.panels.menu.collapsed) {
            store.state.panels.menu.collapsed = true
            store.save()
        }
        // On mobile, ensure context starts collapsed (hidden) so toggle button is visible
        if (isMobile && store.state.panels?.context && !store.state.panels.context.collapsed) {
            store.state.panels.context.collapsed = true
            store.save()
        }
    }, [isMobile])

    const handleMobileMenuToggle = () => {
        if (store.state.panels?.menu) {
            store.state.panels.menu.collapsed = !store.state.panels.menu.collapsed
            store.save()
        }
    }

    const handleMenuBackdropClick = () => {
        if (isMobile && store.state.panels?.menu && !store.state.panels.menu.collapsed) {
            store.state.panels.menu.collapsed = true
            store.save()
        }
    }

    const handleContextBackdropClick = () => {
        if (isMobile && store.state.panels?.context && !store.state.panels.context.collapsed) {
            store.state.panels.context.collapsed = true
            store.save()
        }
    }

    const handleMobileContextToggle = () => {
        if (store.state.panels?.context) {
            store.state.panels.context.collapsed = !store.state.panels.context.collapsed
            store.save()
        }
    }

    // Access store state directly in render for reactivity
    // Reading these values in render ensures component re-renders when they change
    const menuCollapsed = store.state.panels?.menu?.collapsed ?? true // Default to collapsed on mobile
    const contextCollapsed = store.state.panels?.context?.collapsed ?? true // Default to collapsed on mobile
    
    // Always render buttons - CSS will handle visibility based on screen size
    // This ensures buttons are available even if isMobile isn't set correctly initially
    const showMobileMenuToggle = menuCollapsed && menu
    const showMobileMenuClose = !menuCollapsed && menu
    const showMobileContextToggle = contextCollapsed && context
    const showMobileContextClose = !contextCollapsed && context

    return (
        <div class="c-app-layout">
            <div style={{position: 'absolute', visibility: 'hidden'}}>{$t('direction_helper')}</div>
            {menu}
            {isMobile && !menuCollapsed && (
                <div class="c-panel-menu-backdrop" onClick={handleMenuBackdropClick} aria-hidden="true" />
            )}
            {isMobile && !contextCollapsed && (
                <div class="c-panel-context-backdrop" onClick={handleContextBackdropClick} aria-hidden="true" />
            )}
            <main class="content">
                {/* Menu toggle buttons - positioned top-right */}
                {/* Always render - CSS handles mobile visibility */}
                {showMobileMenuToggle && (
                    <button
                        class="c-mobile-menu-toggle"
                        onClick={handleMobileMenuToggle}
                        aria-label="Open menu"
                    >
                        <Icon name="menu_hamburger" size="d" />
                    </button>
                )}
                {showMobileMenuClose && (
                    <button
                        class="c-mobile-menu-close"
                        onClick={handleMobileMenuToggle}
                        aria-label="Close menu"
                    >
                        <Icon name="close_x" size="d" />
                    </button>
                )}
                {/* Context toggle buttons - positioned top-left */}
                {/* Always render - CSS handles mobile visibility */}
                {showMobileContextToggle && (
                    <button
                        class="c-mobile-context-toggle"
                        onClick={handleMobileContextToggle}
                        aria-label="Open context panel"
                    >
                        <Icon name="menu_hamburger" size="d" />
                    </button>
                )}
                {showMobileContextClose && (
                    <button
                        class="c-mobile-context-close"
                        onClick={handleMobileContextToggle}
                        aria-label="Close context panel"
                    >
                        <Icon name="close_x" size="d" />
                    </button>
                )}
                {children}
            </main>
            {context}
        </div>
    )
}
