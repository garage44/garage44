import {$s} from '@/app'
import {AppLayout, Icon, PanelContext, ThemeToggle} from '@garage44/common/components'
import {Link} from 'preact-router/match'
import {Router} from 'preact-router'
import {useState, useEffect} from 'preact/hooks'
import {Components} from './pages/components'
import {Forms} from './pages/forms'
import {Tokens} from './pages/tokens'
import './main.css'

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
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setActiveComponent(id)
        }
    }

    // Track active component on scroll
    useEffect(() => {
        if (!isComponentsRoute) return

        const handleScroll = () => {
            const sections = components.map(name => {
                const id = name.toLowerCase().replaceAll(/\s+/g, '-')
                const element = document.querySelector(`#${id}`)
                return { id, element }
            }).filter(s => s.element)

            // Find the section currently in view
            const viewportMiddle = window.scrollY + window.innerHeight / 3

            for (const section of sections) {
                const rect = section.element!.getBoundingClientRect()
                const top = rect.top + window.scrollY
                const bottom = top + rect.height

                if (viewportMiddle >= top && viewportMiddle < bottom) {
                    setActiveComponent(section.id)
                    break
                }
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial check

        return () => window.removeEventListener('scroll', handleScroll)
    }, [isComponentsRoute])

    return (
        <AppLayout
            sidebar={
                <PanelContext
                    collapsed={$s.panel.collapsed}
                    onCollapseChange={(collapsed) => {
                        $s.panel.collapsed = collapsed
                    }}
                    logoSrc="/img/logo.png"
                    logoText="Common"
                    navigation={
                        <>
                            <Link
                                activeClassName="active"
                                href="/tokens"
                                onClick={() => $s.currentRoute = '/tokens'}
                            >
                                <Icon name="palette" type="info"/>
                                <span>Design Tokens</span>
                            </Link>
                            <Link
                                activeClassName="active"
                                href="/components"
                                onClick={() => $s.currentRoute = '/components'}
                            >
                                <Icon name="extension" type="info"/>
                                <span>Components</span>
                            </Link>
                            {isComponentsRoute && (
                                <div class="submenu">
                                    {components.map(componentName => {
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
                            <Link
                                activeClassName="active"
                                href="/forms"
                                onClick={() => $s.currentRoute = '/forms'}
                            >
                                <Icon name="description" type="info"/>
                                <span>Forms</span>
                            </Link>
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