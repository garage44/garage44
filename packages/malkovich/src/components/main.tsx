import {$s} from '@/app'
import {AppLayout, MenuItem, PanelMenu, Submenu, ThemeToggle} from '@garage44/common/components'
import {Router} from 'preact-router'
import {useState, useEffect} from 'preact/hooks'
import {Components} from './pages/components'
import {Forms} from './pages/forms'
import {Tokens} from './pages/tokens'
import {Home} from './pages/home'
import {Frontend} from './pages/frontend'
import {Backend} from './pages/backend'
import {Markdown} from './pages/markdown'

// List of all components for the submenu
const components = [
    'Button',
    'Field Text',
    'Field Checkbox',
    'Icon',
    'Progress',
    'Field Select',
    'Field Checkbox Group',
    'Field Upload',
    'Notifications',
    'Button Group',
    'Chart',
    'Hint',
    'Splash',
    'Icon Chat',
    'Icon Logo',
    'Field Number',
    'Field Radio Group',
    'Field Slider',
    'Field Textarea',
    'Field Multi Select',
    'Context Input',
    'Context Select',
]

export const Main = () => {
    const [activeComponent, setActiveComponent] = useState<string | null>(null)
    const isComponentsRoute = $s.currentRoute === '/components'

    // Handle route changes
    const handleRouteChange = (e) => {
        $s.currentRoute = e.url
    }

    // Scroll to component section
    const scrollToComponent = (componentName: string) => {
        const id = componentName.toLowerCase().replaceAll(/\s+/g, '-')
        const element = document.querySelector(`#${id}`)
        if (element) {
            element.scrollIntoView({behavior: 'smooth', block: 'start'})
            setActiveComponent(id)
        }
    }

    // Track active component on scroll
    useEffect(() => {
        if (!isComponentsRoute) return

        const viewElement = document.querySelector('.view')
        if (!viewElement) return

        const handleScroll = () => {
            const sections = components.map((name) => {
                const id = name.toLowerCase().replaceAll(/\s+/g, '-')
                const element = document.querySelector(`#${id}`)
                return {element, id}
            }).filter((s) => s.element)

            // Find the section currently in view
            const scrollTop = viewElement.scrollTop
            const viewportHeight = viewElement.clientHeight
            const viewportMiddle = scrollTop + viewportHeight / 3

            for (const section of sections) {
                const rect = section.element!.getBoundingClientRect()
                const containerRect = viewElement.getBoundingClientRect()
                const top = rect.top - containerRect.top + scrollTop
                const bottom = top + rect.height

                if (viewportMiddle >= top && viewportMiddle < bottom) {
                    setActiveComponent(section.id)
                    break
                }
            }
        }

        viewElement.addEventListener('scroll', handleScroll, {passive: true})
        handleScroll() // Initial check

        return () => viewElement.removeEventListener('scroll', handleScroll)
    }, [isComponentsRoute])

    return (
        <AppLayout
            menu={
                <PanelMenu
                    collapsed={$s.panels.menu.collapsed}
                    onCollapseChange={(collapsed) => {
                        $s.panels.menu.collapsed = collapsed
                    }}
                    logoSrc="/img/logo.png"
                    logoText="Garage442"
                    navigation={
                        <>
                            <MenuItem
                                active={$s.currentRoute === '/'}
                                collapsed={$s.panels.menu.collapsed}
                                href="/"
                                icon="home"
                                iconType="info"
                                onClick={() => $s.currentRoute = '/'}
                                text="Home"
                            />
                            <MenuItem
                                active={$s.currentRoute === '/frontend'}
                                collapsed={$s.panels.menu.collapsed}
                                href="/frontend"
                                icon="code"
                                iconType="info"
                                onClick={() => $s.currentRoute = '/frontend'}
                                text="Frontend"
                            />
                            <MenuItem
                                active={$s.currentRoute === '/backend'}
                                collapsed={$s.panels.menu.collapsed}
                                href="/backend"
                                icon="server"
                                iconType="info"
                                onClick={() => $s.currentRoute = '/backend'}
                                text="Backend"
                            />
                            <MenuItem
                                active={$s.currentRoute === '/tokens'}
                                collapsed={$s.panels.menu.collapsed}
                                href="/tokens"
                                icon="settings"
                                iconType="info"
                                onClick={() => $s.currentRoute = '/tokens'}
                                text="Design Tokens"
                            />
                            <MenuItem
                                active={$s.currentRoute === '/components'}
                                collapsed={$s.panels.menu.collapsed}
                                href="/components"
                                icon="dashboard"
                                iconType="info"
                                onClick={() => $s.currentRoute = '/components'}
                                text="Components"
                            />
                            {isComponentsRoute && (
                                <Submenu
                                    collapsed={$s.panels.menu.collapsed}
                                    items={components.map((componentName) => {
                                        const id = componentName.toLowerCase().replaceAll(/\s+/g, '-')
                                        return {
                                            active: activeComponent === id,
                                            id,
                                            label: componentName,
                                            onClick: () => scrollToComponent(componentName),
                                        }
                                    })}
                                />
                            )}
                            <MenuItem
                                active={$s.currentRoute === '/forms'}
                                collapsed={$s.panels.menu.collapsed}
                                href="/forms"
                                icon="message"
                                iconType="info"
                                onClick={() => $s.currentRoute = '/forms'}
                                text="Forms"
                            />
                        </>
                    }
                    actions={
                        <ThemeToggle />
                    }
                />
            }
        >
            <div class="view">
                <Router onChange={handleRouteChange}>
                    <Home path="/" default />
                    <Frontend path="/frontend" />
                    <Backend path="/backend" />
                    <Components path="/components" />
                    <Forms path="/forms" />
                    <Tokens path="/tokens" />
                    <Markdown path="/:path*" />
                </Router>
            </div>
        </AppLayout>
    )
}