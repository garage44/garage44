import {$s, i18n} from '@/app'
import {api, notifier, ws} from '@garage44/common/app'
import {$t} from '@garage44/expressio'
import {WorkspaceSettings, WorkspaceTranslations} from '@/components/pages'
import {Settings} from '@/components/settings/settings'
import {
    AppLayout,
    FieldSelect,
    MenuGroup,
    MenuItem,
    Notifications,
    PanelMenu,
    Progress,
    UserMenu,
} from '@garage44/common/components'
import {Link, Router, getCurrentUrl, route} from 'preact-router'
import {mergeDeep} from '@garage44/common/lib/utils'
import {Login} from '@/components/pages/login/login'
import {deepSignal} from 'deepsignal'
import {toIso6391} from '../../../lib/enola/iso-codes.ts'
import {useEffect} from 'preact/hooks'

const state = deepSignal({
    workspace_id: null,
})

// Helper to determine if we're in single workspace mode
const isSingleWorkspace = () => $s.workspaces && $s.workspaces.length === 1

// Helper to get the appropriate translations URL based on workspace count
const getTranslationsUrl = () => {
    if (isSingleWorkspace()) {
        return '/translations'
    }
    if ($s.workspace) {
        return `/workspaces/${$s.workspace.config.workspace_id}/translations`
    }
    return '/translations'
}

// Helper to get the appropriate config URL based on workspace count
const getConfigUrl = () => {
    if (isSingleWorkspace()) {
        return '/config'
    }
    if ($s.workspace) {
        return `/workspaces/${$s.workspace.config.workspace_id}/settings`
    }
    return '/config'
}

export const Main = () => {
    useEffect(() => {
        (async() => {
            const context = await api.get('/api/context')

            /*
             * Context now includes full user profile (id, username, profile.avatar, profile.displayName)
             * Set user authentication/admin flags
             */
            $s.profile.admin = context.admin || false
            $s.profile.authenticated = context.authenticated || false
            // Set profile data from context
            if (context.id) $s.profile.id = context.id
            if (context.username) $s.profile.username = context.username
            if (context.password) $s.profile.password = context.password
            if (context.profile) {
                $s.profile.avatar = context.profile.avatar || 'placeholder-1.png'
                $s.profile.displayName = context.profile.displayName || context.username || 'User'
            }

            if (context.authenticated) {
                ws.connect()
                const config = await api.get('/api/config')

                $s.profile.authenticated = true
                mergeDeep($s, {
                    enola: config.enola,
                    workspaces: config.workspaces,
                }, {usage: {loading: false}})

                // Auto-select first workspace if available and no workspace is selected
                if (config.workspaces && config.workspaces.length > 0 && !state.workspace_id) {
                    const firstWorkspace = config.workspaces[0]
                    state.workspace_id = firstWorkspace.workspace_id
                    $s.workspace = await ws.get(`/api/workspaces/${firstWorkspace.workspace_id}`)
                }
            } else {
                route('/login')
            }
        })()
    }, [])

    if ($s.profile.authenticated === null) {
        return null
    }

    if ($s.profile.authenticated === false) {
        return <Login />
    }
    const handleRoute = async({url}: {url: string}) => {
        // Update URL in global state for reactive access
        $s.env.url = url

        /*
         * Redirect root to appropriate translations URL:
         * - Single workspace: /translations
         * - Multiple workspaces: /workspaces/:id/translations
         */
        if (url === '/') {
            if ($s.workspaces && $s.workspaces.length > 0) {
                if (isSingleWorkspace()) {
                    route('/translations', true)
                } else {
                    const firstWorkspace = $s.workspaces[0]
                    route(`/workspaces/${firstWorkspace.workspace_id}/translations`, true)
                }
            }
            return
        }

        /*
         * Handle simplified routes (/translations, /config):
         * These automatically use the first/single workspace
         */
        if (url === '/translations' || url === '/config') {
            // Ensure a workspace is loaded for these routes
            if (!$s.workspace && $s.workspaces && $s.workspaces.length > 0) {
                const firstWorkspace = $s.workspaces[0]
                state.workspace_id = firstWorkspace.workspace_id
                $s.workspace = await ws.get(`/api/workspaces/${firstWorkspace.workspace_id}`)
            }
            return
        }

        // Handle full workspace routes (multi-workspace mode)
        const match = url.match(/\/workspaces\/([^/]+)/)
        if (match && (!$s.workspace || match[1] !== $s.workspace.config.workspace_id)) {
            const result = await ws.get(`/api/workspaces/${match[1]}`)

            if (result.error) {
                notifier.notify({message: $t(i18n.workspace.error.not_found), type: 'error'})
                // On error, redirect to appropriate translations
                if (isSingleWorkspace()) {
                    route('/translations', true)
                } else if ($s.workspaces && $s.workspaces.length > 0) {
                    const firstWorkspace = $s.workspaces[0]
                    route(`/workspaces/${firstWorkspace.workspace_id}/translations`, true)
                }
            } else {
                state.workspace_id = match[1]
                $s.workspace = result
            }
        }
    }

    return (
<>
        <AppLayout
            menu={(
                <PanelMenu
                    actions={(
                        <UserMenu
                            collapsed={$s.panels.menu.collapsed}
                            onLogout={async() => {
                                const result = await api.get('/api/logout')
                                $s.profile.authenticated = result.authenticated || false
                                $s.profile.admin = result.admin || false
                                route('/')
                            }}
                            settingsHref='/settings'
                            user={{
                                id: $s.profile.id || null,
                                profile: {
                                    avatar: $s.profile.avatar || null,
                                    displayName: $s.profile.displayName || $s.profile.username || 'User',
                                },
                            }}
                        />
                      )}
                    collapsed={$s.panels.menu.collapsed}
                    footer={
                        !!Object.values($s.enola.engines).length &&
                        <div class='engines'>
                            {Object.values($s.enola.engines).filter((i) => i.active).map((engine) => {
                                return (
                                    <div class='usage' key={engine.name}>
                                        <span>{$t(i18n.menu.usage, {engine: engine.name})}</span>
                                        <Progress
                                            boundaries={[engine.usage.count, engine.usage.limit]}
                                            iso6391={toIso6391($s.language_ui.selection)}
                                            loading={engine.usage.loading}
                                            percentage={engine.usage.count / engine.usage.limit}
                                        />
                                    </div>
                                )
                            })}
                        </div>

                    }
                    LinkComponent={Link}
                    logoCommitHash={process.env.APP_COMMIT_HASH || ''}
                    logoHref='/'
                    logoSrc='/public/img/logo.svg'
                    logoText='Expressio'
                    logoVersion={process.env.APP_VERSION || ''}
                    navigation={(
                        <MenuGroup collapsed={$s.panels.menu.collapsed}>
                            {/* Only show workspace dropdown when multiple workspaces exist */}
                            {$s.workspaces && $s.workspaces.length > 1 &&
                                <FieldSelect
                                    disabled={!$s.workspaces.length}
                                    help={$t(i18n.menu.workspaces.help)}
                                    label={$t(i18n.menu.workspaces.label)}
                                    model={state.$workspace_id}
                                    onChange={async(workspace_id) => {
                                        $s.workspace = (await ws.get(`/api/workspaces/${workspace_id}`))
                                        // Check if current route is valid for the new workspace
                                        const currentPath = getCurrentUrl()
                                        const isOnSettings = currentPath.endsWith('/settings') || currentPath === '/config'
                                        const isOnTranslations = currentPath.endsWith('/translations')

                                        // Navigate to the appropriate route for the new workspace
                                        if (isOnSettings) {
                                            route(`/workspaces/${workspace_id}/settings`)
                                        } else if (isOnTranslations) {
                                            route(`/workspaces/${workspace_id}/translations`)
                                        } else {
                                            route(`/workspaces/${workspace_id}/translations`)
                                        }
                                    }}
                                    options={$s.workspaces.map((i) => ({id: i.workspace_id, name: i.workspace_id}))}
                                    placeholder={$t(i18n.menu.workspaces.placeholder)}
                                />}

                            {/* Translations menu item - first */}
                            <MenuItem
                                active={$s.env.url.endsWith('/translations')}
                                collapsed={$s.panels.menu.collapsed}
                                disabled={!$s.workspace}
                                href={getTranslationsUrl()}
                                icon='translate'
                                iconType='info'
                                text={$t(i18n.menu.workspace.translations)}
                            />
                            {/* Workspace config menu item - second */}
                            <MenuItem
                                active={$s.env.url.endsWith('/settings') || $s.env.url === '/config'}
                                collapsed={$s.panels.menu.collapsed}
                                disabled={!$s.workspace}
                                href={getConfigUrl()}
                                icon='workspace'
                                iconType='info'
                                text={$t(i18n.menu.workspace.config)}
                            />
                        </MenuGroup>
                      )}
                    onCollapseChange={(collapsed) => {
                        $s.panels.menu.collapsed = collapsed
                    }}
                />
              )}
        >
            <div class='view'>
                <Router onChange={handleRoute}>
                    {/* User settings - always at /settings */}
                    <Settings path='/settings' />

                    {/* Simplified routes for single workspace mode */}
                    <WorkspaceTranslations path='/translations' />
                    <WorkspaceSettings path='/config' />

                    {/* Full workspace routes for multi-workspace mode */}
                    <WorkspaceSettings path='/workspaces/:workspace/settings' />
                    <WorkspaceTranslations path='/workspaces/:workspace/translations' />
                </Router>
            </div>
        </AppLayout>
        <Notifications notifications={$s.notifications} />
</>
    )
}
