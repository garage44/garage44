import {$s, ws} from '@/app'
import {$t, api, notify} from '@garage44/common/app'
import {Config, WorkspaceSettings, WorkspaceTranslations} from '@/components/pages'
import {Icon, Notifications, Progress} from '@garage44/common/components'
import {Router, getCurrentUrl, route} from 'preact-router'
import {FieldSelect} from '@garage44/common/components'
import {Link} from 'preact-router/match'
import {Login} from '@/components/pages/login/login'
import {classes} from '@garage44/common/lib/utils'
import {deepSignal} from 'deepsignal'
import {mergeDeep} from '@garage44/common/lib/utils'
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
    } else if ($s.user.authenticated === false) {
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
            const result = await api.get(`/api/workspaces/${match[1]}`)

            if (!result.error) {
                state.workspace_id = match[1]
                $s.workspace = result
            } else {
                // Replace console.log with proper error handling
                notify({message: $t('workspace.error.not_found'), type: 'error'})

                // Use route with replace option to avoid adding to history
                route('/', true)
            }
        }
    }

    return <>
        <div
            class={classes('panel fade-in', {
                collapsed: $s.panel.collapsed,
            })}
        >
            <div class="top-bar">
                <div class="logo">
                    <span style="position: absolute; visibility: hidden;">
                        {$t('direction_helper')}
                    </span>
                    <img src="/public/img/logo.svg" alt="Expressio Logo"/>
                    <span class="logo-text">Expressio</span>
                </div>

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
                            $s.workspace = (await api.get(`/api/workspaces/${workspace_id}`))
                            // Check if current route is valid for the new workspace
                            const currentPath = getCurrentUrl()
                            const isValidRoute = currentPath.endsWith('/settings') || currentPath.endsWith('/translations')

                            // If we're not on a valid workspace route, default to settings
                            let newRoute
                            if (!isValidRoute) {
                                newRoute = `/workspaces/${workspace_id}/settings`
                            } else {
                                // Keep the same page type (settings/translations) but update workspace
                                const routeSuffix = currentPath.endsWith('/settings') ? 'settings' : 'translations'
                                newRoute = `/workspaces/${workspace_id}/${routeSuffix}`
                            }

                            route(newRoute)
                        }}
                        options={$s.workspaces.map((i) => ({id: i.workspace_id, name: i.workspace_id}))}
                    />

                    <Link
                        activeClassName="active"
                        className={classes({disabled: !$s.workspace})}
                        href={$s.workspace ? `/workspaces/${$s.workspace.config.workspace_id}/settings` : ''}
                    >
                        <Icon name="workspace" type="info"/>
                        <span>{$t('menu.workspace.config')}</span>
                    </Link>
                    <Link
                        activeClassName="active"
                        className={classes({disabled: !$s.workspace})}
                        href={$s.workspace ? `/workspaces/${$s.workspace.config.workspace_id}/translations` : ''}
                    >
                        <Icon name="translate" type="info"/>
                        <span>{$t('menu.workspace.translations')}</span>
                    </Link>
                </div>
            </div>

            <div className="actions">
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
            </div>

            {!!Object.values($s.enola.engines).length && <div className="engines">
                {Object.values($s.enola.engines).filter((i) => i.active).map((engine) => {
                    return <div className="usage">
                        {$t('menu.usage', {engine: engine.name})}
                        <Progress
                            boundaries={[engine.usage.count, engine.usage.limit]}
                            loading={engine.usage.loading}
                            percentage={engine.usage.count / engine.usage.limit}
                            iso6391={toIso6391($s.language_ui.selection)}
                        />
                    </div>})}
            </div>}
        </div>
        <div class="view-layout fade-in">
            <div class="view">
                <Router onChange={handleRoute}>
                    {$s.user.admin && <Config path="/" />}
                    {<WorkspaceSettings path="/workspaces/:workspace/settings" />}
                    {<WorkspaceTranslations path="/workspaces/:workspace/translations" />}
                </Router>
            </div>
        </div>
        <Notifications notifications={$s.notifications}/>
    </>
}
