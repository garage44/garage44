import {$s} from '@/app'
import {AppLayout, MenuItem, PanelMenu, ThemeToggle} from '@garage44/common/components'
import {Router} from 'preact-router'
import {useState, useEffect} from 'preact/hooks'
import {Components} from './pages/components'
import {Forms} from './pages/forms'
import {Tokens} from './pages/tokens'

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
    const isComponentsRoute = $s.currentRoute === '/components' || $s.currentRoute === '/'

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
                    logoText="Common"
                    navigation={
                        <>
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
                                active={$s.currentRoute === '/components' || $s.currentRoute === '/'}
                                collapsed={$s.panels.menu.collapsed}
                                href="/components"
                                icon="dashboard"
                                iconType="info"
                                onClick={() => $s.currentRoute = '/components'}
                                text="Components"
                            />
                            {isComponentsRoute && (
                                <div class="submenu">
                                    {components.map((componentName) => {
                                        const id = componentName.toLowerCase().replaceAll(/\s+/g, '-')
                                        return (
                                            <button
                                                key={id}
                                                class={`submenu-item ${activeComponent === id ? 'active' : ''}`}
                                                onClick={() => scrollToComponent(componentName)}
                                            >
                                                {componentName}
                                            </button>
                                        )
                                    })}
                                </div>
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
                <Router>
                    <Components path="/components" />
                    <Components path="/" default />
                    <Forms path="/forms" />
                    <Tokens path="/tokens" />
                </Router>
            </div>
        </AppLayout>
    )
}