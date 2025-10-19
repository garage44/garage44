import {ComponentChildren} from 'preact'

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
export const AppLayout = ({sidebar, children}: AppLayoutProps) => (
    <div class="c-app-layout">
        {sidebar}
        <main class="content">
            {children}
        </main>
    </div>
)
