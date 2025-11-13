import {ComponentChildren} from 'preact'
import {$t} from '@/app'
import {store} from '@garage44/common/app'
import classnames from 'classnames'

interface AppLayoutProps {
    children: ComponentChildren
    menu?: ComponentChildren
    context?: ComponentChildren
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
export const AppLayout = ({children, menu, context}: AppLayoutProps) => (
    <div class="c-app-layout">
        <div style={{position: 'absolute', visibility: 'hidden'}}>{$t('direction_helper')}</div>
        {menu}
        <main class="content">
            {children}
        </main>
        {context}
    </div>
)
