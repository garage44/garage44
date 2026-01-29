import {$s} from '@/app'
import {api, notifier, ws} from '@garage44/common/app'
import {Board, TicketDetail} from '@/components/pages'
import {
    AppLayout,
    MenuGroup,
    MenuItem,
    Notifications,
    PanelMenu,
    UserMenu,
} from '@garage44/common/components'
import {Link, Router, getCurrentUrl, route} from 'preact-router'
import {Login} from '@/components/pages/login/login'
import {useEffect} from 'preact/hooks'
import {effect} from '@preact/signals'

export const Main = () => {
    useEffect(() => {
        (async() => {
            const context = await api.get('/api/context')

            $s.profile.admin = context.admin || false
            $s.profile.authenticated = context.authenticated || false
            if (context.id) $s.profile.id = context.id
            if (context.username) $s.profile.username = context.username
            if (context.profile) {
                $s.profile.avatar = context.profile.avatar || 'placeholder-1.png'
                $s.profile.displayName = context.profile.displayName || context.username || 'User'
            }

            if (context.authenticated) {
                ws.connect()

                // Load initial data
                const ticketsResult = await ws.get('/api/tickets')
                if (ticketsResult.tickets) {
                    $s.tickets = ticketsResult.tickets
                }

                const reposResult = await ws.get('/api/repositories')
                if (reposResult.repositories) {
                    $s.repositories = reposResult.repositories
                }

                const agentsResult = await ws.get('/api/agents')
                if (agentsResult.agents) {
                    $s.agents = agentsResult.agents
                }

                // Subscribe to real-time updates
                ws.on('/tickets', (data) => {
                    if (data.type === 'ticket:created' || data.type === 'ticket:updated') {
                        // Update ticket in state
                        const index = $s.tickets.findIndex((t) => t.id === data.ticket.id)
                        if (index >= 0) {
                            $s.tickets[index] = data.ticket
                        } else {
                            $s.tickets = [...$s.tickets, data.ticket]
                        }
                    } else if (data.type === 'ticket:deleted') {
                        $s.tickets = $s.tickets.filter((t) => t.id !== data.ticketId)
                    }
                })

                ws.on('/repositories', (data) => {
                    if (data.type === 'repository:created' || data.type === 'repository:updated') {
                        const index = $s.repositories.findIndex((r) => r.id === data.repository.id)
                        if (index >= 0) {
                            $s.repositories[index] = data.repository
                        } else {
                            $s.repositories = [...$s.repositories, data.repository]
                        }
                    } else if (data.type === 'repository:deleted') {
                        $s.repositories = $s.repositories.filter((r) => r.id !== data.repositoryId)
                    }
                })
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
        $s.env.url = url

        // Redirect root to board
        if (url === '/') {
            route('/board', true)
        }
    }

    return <>
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
                                route('/board')
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
                    LinkComponent={Link}
                    logoCommitHash={process.env.APP_COMMIT_HASH || ''}
                    logoHref='/board'
                    logoSrc='/public/img/logo.svg'
                    logoText='Nonlinear'
                    logoVersion={process.env.APP_VERSION || ''}
                    navigation={(
                        <MenuGroup collapsed={$s.panels.menu.collapsed}>
                            <MenuItem
                                active={$s.env.url === '/board' || $s.env.url === '/'}
                                collapsed={$s.panels.menu.collapsed}
                                href='/board'
                                icon='view_kanban'
                                iconType='info'
                                text='Kanban Board'
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
                    <Board path='/board' default />
                    <Board path='/' />
                    <TicketDetail path='/tickets/:ticketId' />
                </Router>
            </div>
        </AppLayout>
        <Notifications notifications={$s.notifications} />
    </>
}
