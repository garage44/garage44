import {$s} from '@/app'
import {$t, api, notifier, ws} from '@garage44/common/app'
import {Config, WorkspaceSettings, WorkspaceTranslations} from '@/components/pages'
import {AppLayout, FieldSelect, Icon, Notifications, PanelContext, Progress, ThemeToggle} from '@garage44/common/components'
import {Router, getCurrentUrl, route} from 'preact-router'
import {mergeDeep} from '@garage44/common/lib/utils'
import classnames from 'classnames'
import {Link} from 'preact-router/match'
import {Login} from '@/components/pages/login/login'
import {deepSignal} from 'deepsignal'
import {toIso6391} from '@garage44/enola/iso-codes'
import {useEffect} from 'preact/hooks'

const state = deepSignal({
    workspace_id: null,
})

export const Main = () => {
    useEffect(() => {
        (async() => {
            const context = await api.get('/api/context')
            mergeDeep($s.user, context)

            if (context.authenticated) {
                ws.connect()
                const config = await api.get('/api/config')

                $s.user.authenticated = true
                mergeDeep($s, {
                    enola: config.enola,
                    workspaces: config.workspaces,
                }, {usage: {loading: false}})
            } else {
                route('/login')
            }
        })()
    }, [])

    if ($s.user.authenticated === null) {
        return null
    }

    if ($s.user.authenticated === false) {
        return <Login />
    }
    const handleRoute = async({url}: {url: string}) => {
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
                notifier.notify({message: $t('workspace.error.not_found'), type: 'error'})

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
            sidebar={
                <PanelContext
                    collapsed={$s.panel.collapsed}
                    onCollapseChange={(collapsed) => {
                        $s.panel.collapsed = collapsed
                    }}
                    logoSrc="/public/img/logo.svg"
                    logoText="Expressio"
                    navigation={
                        <>
                            {$s.user.admin && <Link activeClassName="active" href="/">
                                <Icon name="settings" type="info"/>
                                <span>{$t('menu.settings')}</span>
                            </Link>}

                            <div class="menu-group">
                                <FieldSelect
                                    disabled={!$s.workspaces.length}
                                    help={$t('menu.workspaces.help')}
                                    label={$t('menu.workspaces.label')}
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
                                    placeholder={$t('menu.workspaces.placeholder')}
                                />

                                <Link
                                    activeClassName="active"
                                    className={classnames({disabled: !$s.workspace})}
                                    href={$s.workspace ? `/workspaces/${$s.workspace.config.workspace_id}/settings` : ''}
                                >
                                    <Icon name="workspace" type="info"/>
                                    <span>{$t('menu.workspace.config')}</span>
                                </Link>
                                <Link
                                    activeClassName="active"
                                    className={classnames({disabled: !$s.workspace})}
                                    href={$s.workspace ? `/workspaces/${$s.workspace.config.workspace_id}/translations` : ''}
                                >
                                    <Icon name="translate" type="info"/>
                                    <span>{$t('menu.workspace.translations')}</span>
                                </Link>
                            </div>
                        </>
                    }
                    actions={
                        <>
                            <ThemeToggle />
                            <Icon
                                name="logout"
                                onClick={async() => {
                                    const result = await api.get('/api/logout')
                                    mergeDeep($s.user, result)
                                    route('/')
                                }}
                                tip={$t('menu.logout')}
                                type="info"
                            />
                        </>
                    }
                    footer={
                        !!Object.values($s.enola.engines).length && (
                            <div class="engines">
                                {Object.values($s.enola.engines).filter((i) => i.active).map((engine) =>
                                    <div class="usage" key={engine.name}>
                                        {$t('menu.usage', {engine: engine.name})}
                                        <Progress
                                            boundaries={[engine.usage.count, engine.usage.limit]}
                                            loading={engine.usage.loading}
                                            percentage={engine.usage.count / engine.usage.limit}
                                            iso6391={toIso6391($s.language_ui.selection)}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    }
                />
            }
        >
            <div class="view">
                <Router onChange={handleRoute}>
                    {$s.user.admin && <Config path="/" />}
                    <WorkspaceSettings path="/workspaces/:workspace/settings" />
                    <WorkspaceTranslations path="/workspaces/:workspace/translations" />
                </Router>
            </div>
        </AppLayout>
        <Notifications notifications={$s.notifications}/>
    </>
}
