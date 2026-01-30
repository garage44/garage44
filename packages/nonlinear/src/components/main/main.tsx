import {$s} from '@/app'
import {api, store, ws} from '@garage44/common/app'
import {Board, Settings, TicketDetail} from '@/components/pages'
import {
    AppLayout,
    MenuGroup,
    MenuItem,
    Notifications,
    PanelContext,
    PanelMenu,
    UserMenu,
} from '@garage44/common/components'
import {TicketForm} from '@/components/elements/ticket-form/ticket-form'
import {Link, Router, route} from 'preact-router'
import {Login} from '@/components/pages/login/login'
import {useEffect} from 'preact/hooks'

export const Main = () => {
    useEffect(() => {
        (async() => {
            const context = await api.get('/api/context')

            /*
             * Check if user was authenticated - the response should have authenticated: true
             * Also check if we have user data (id, username) as an alternative indicator
             * This handles cases where authenticated might not be set but user data is present
             */
            const isAuthenticated = context.authenticated || (context.id && context.username)

            $s.profile.admin = context.admin || false
            $s.profile.authenticated = isAuthenticated || false
            if (context.id) $s.profile.id = context.id
            if (context.username) $s.profile.username = context.username
            if (context.profile) {
                $s.profile.avatar = context.profile.avatar || 'placeholder-1.png'
                $s.profile.displayName = context.profile.displayName || context.username || 'User'
            }

            if (isAuthenticated) {
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
                        // Update ticket in state - create new array for DeepSignal reactivity
                        const index = $s.tickets.findIndex((t) => t.id === data.ticket.id)
                        if (index >= 0) {
                            const updatedTickets = [...$s.tickets]
                            updatedTickets[index] = data.ticket
                            $s.tickets = updatedTickets
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

    useEffect(() => {
        // Migrate old default width (200px) to new default (600px)
        if ($s.panels.context.width === 200) {
            $s.panels.context.width = 600
            store.save()
        }
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

    const handleClosePanel = () => {
        $s.selectedLane = null
        $s.panels.context.collapsed = true
        store.save()
    }

    const handleTicketCreated = async() => {
        // Reload tickets to get the new one
        const result = await ws.get('/api/tickets')
        if (result.tickets) {
            $s.tickets = result.tickets
        }
    }

    return <>
        <AppLayout
            context={
                $s.selectedLane ?

                            <PanelContext
                                collapsed={false}
                                defaultWidth={600}
                                maxWidth={1000}
                                minWidth={64}
                                onWidthChange={(width) => {
                                    $s.panels.context.width = width
                                    store.save()
                                }}
                                width={$s.panels.context.width === 200 ? undefined : $s.panels.context.width}
                            >
                                <TicketForm
                                    initialStatus={$s.selectedLane}
                                    onClose={handleClosePanel}
                                    onSuccess={handleTicketCreated}
                                />
                            </PanelContext> :
                    null
            }
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
                    <Board default path='/board' />
                    <Board path='/' />
                    <TicketDetail path='/tickets/:ticketId' />
                    <Settings path='/settings' />
                </Router>
            </div>
        </AppLayout>
        <Notifications notifications={$s.notifications} />
    </>
}
