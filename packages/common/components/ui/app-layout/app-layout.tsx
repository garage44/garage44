import {ComponentChildren} from 'preact'
import {$t} from '@/app'

interface AppLayoutProps {
    children: ComponentChildren
    sidebar: ComponentChildren
}

/**
 * AppLayout - Generic application layout component
 *
 * Provides a consistent sidebar + main content layout pattern
 * used across all Garage44 applications.
 *
 * @example
 * <AppLayout sidebar={<Sidebar {...props} />}>
 *   <YourMainContent />
 * </AppLayout>
 */
export const AppLayout = ({children, sidebar}: AppLayoutProps) => (
    <div class="c-app-layout">
        <div style="position: absolute; visibility: hidden;">{$t('direction_helper')}</div>
        {sidebar}
        <main class="content">
            {children}
        </main>
    </div>
)
