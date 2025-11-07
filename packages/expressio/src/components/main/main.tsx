import {$s, i18n} from '@/app'
import {api, notifier, ws} from '@garage44/common/app'
import {$t} from '@garage44/expressio'
import {Config, WorkspaceSettings, WorkspaceTranslations} from '@/components/pages'
import {Settings} from '@/components/settings/settings'
import {AppLayout, FieldSelect, MenuGroup, MenuItem, Notifications, PanelMenu, Progress, UserMenu} from '@garage44/common/components'
import {Router, getCurrentUrl, route} from 'preact-router'
import {mergeDeep} from '@garage44/common/lib/utils'
import {Login} from '@/components/pages/login/login'
import {deepSignal} from 'deepsignal'
import {toIso6391} from '@garage44/enola/iso-codes'
import {useEffect} from 'preact/hooks'

const state = deepSignal({
    workspace_id: null,
})

export const Main = () => {
    useEffect(() => {
        ;(async() => {
            const context = await api.get('/api/context')
            // Context now includes full user profile (id, username, profile.avatar, profile.displayName)
            // Set user authentication/admin flags
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

        // Don't process if we're already on the root path
        if (url === '/') {
            $s.workspace = null
            state.workspace_id = null
            return
        }

        const match = url.match(/\/workspaces\/([^/]+)/)
        if (match && (!$s.workspace || match[1] !== $s.workspace.config.workspace_id)) {
            const result = await ws.get(`/api/workspaces/${match[1]}`)

            if (result.error) {
                // Replace console.log with proper error handling
                notifier.notify({message: $t(i18n.workspace.error.not_found), type: 'error'})

                // Use route with replace option to avoid adding to history
                route('/', true)
            } else {
                state.workspace_id = match[1]
                $s.workspace = result
            }
        }
    }

    return <>
        <AppLayout
            menu={
                <PanelMenu
                    collapsed={$s.panels.menu.collapsed}
                    onCollapseChange={(collapsed) => {
                        $s.panels.menu.collapsed = collapsed
                    }}
                    logoSrc="/public/img/logo.svg"
                    logoText="Expressio"
                    navigation={

                        <MenuGroup collapsed={$s.panels.menu.collapsed}>
                            {$s.profile.admin && <MenuItem
                                active={$s.env.url === '/'}
                                collapsed={$s.panels.menu.collapsed}
                                href="/"
                                icon="settings"
                                iconType="info"
                                text={$t(i18n.menu.settings)}
                            />}
                            <FieldSelect
                                disabled={!$s.workspaces.length}
                                help={$t(i18n.menu.workspaces.help)}
                                label={$t(i18n.menu.workspaces.label)}
                                model={state.$workspace_id}
                                onChange={async(workspace_id) => {
                                    $s.workspace = (await ws.get(`/api/workspaces/${workspace_id}`))
                                    // Check if current route is valid for the new workspace
                                    const currentPath = getCurrentUrl()
                                    const isValidRoute = currentPath.endsWith('/settings') || currentPath.endsWith('/translations')

                                    // If we're not on a valid workspace route, default to settings
                                    let newRoute
                                    if (isValidRoute) {
                                        // Keep the same page type (settings/translations) but update workspace
                                        const routeSuffix = currentPath.endsWith('/settings') ? 'settings' : 'translations'
                                        newRoute = `/workspaces/${workspace_id}/${routeSuffix}`
                                    } else {
                                        newRoute = `/workspaces/${workspace_id}/settings`
                                    }

                                    route(newRoute)
                                }}
                                options={$s.workspaces.map((i) => ({id: i.workspace_id, name: i.workspace_id}))}
                                placeholder={$t(i18n.menu.workspaces.placeholder)}
                            />

                            <MenuItem
                                active={$s.env.url.endsWith('/settings')}
                                collapsed={$s.panels.menu.collapsed}
                                disabled={!$s.workspace}
                                href={$s.workspace ? `/workspaces/${$s.workspace.config.workspace_id}/settings` : ''}
                                icon="workspace"
                                iconType="info"
                                text={$t(i18n.menu.workspace.config)}
                            />
                            <MenuItem
                                active={$s.env.url.endsWith('/translations')}
                                collapsed={$s.panels.menu.collapsed}
                                disabled={!$s.workspace}
                                href={$s.workspace ? `/workspaces/${$s.workspace.config.workspace_id}/translations` : ''}
                                icon="translate"
                                iconType="info"
                                text={$t(i18n.menu.workspace.translations)}
                            />
                        </MenuGroup>
                    }
                    actions={
                        <UserMenu
                            collapsed={$s.panels.menu.collapsed}
                            onLogout={async() => {
                                const result = await api.get('/api/logout')
                                $s.profile.authenticated = result.authenticated || false
                                $s.profile.admin = result.admin || false
                                route('/')
                            }}
                            settingsHref="/settings"
                            user={{
                                id: $s.profile.id || null,
                                profile: {
                                    avatar: $s.profile.avatar || null,
                                    displayName: $s.profile.displayName || $s.profile.username || 'User',
                                },
                            }}
                        />
                    }
                    footer={
                        !!Object.values($s.enola.engines).length && (
                            <div class="engines">
                                {Object.values($s.enola.engines).filter((i) => i.active).map((engine) =>
                                    <div class="usage" key={engine.name}>
                                        {$t(i18n.menu.usage, {engine: engine.name})}
                                        <Progress
                                            boundaries={[engine.usage.count, engine.usage.limit]}
                                            loading={engine.usage.loading}
                                            percentage={engine.usage.count / engine.usage.limit}
                                            iso6391={toIso6391($s.language_ui.selection)}
                                        />
                                    </div>,
                                )}
                            </div>
                        )
                    }
                />
            }
        >
            <div class="view">
                <Router onChange={handleRoute}>
                    {$s.profile.admin && <Config path="/" />}
                    <Settings path="/settings" />
                    <WorkspaceSettings path="/workspaces/:workspace/settings" />
                    <WorkspaceTranslations path="/workspaces/:workspace/translations" />
                </Router>
            </div>
        </AppLayout>
        <Notifications notifications={$s.notifications}/>
    </>
}
