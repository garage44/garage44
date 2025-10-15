import {ThemeToggle} from '@garage44/common/components'
import {h} from 'preact'
import {route} from 'preact-router'
import {useState, useEffect} from 'preact/hooks'
import {$s} from '../app'

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

export const Navigation = () => {
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
        <nav class="styleguide__nav">
            <div class="styleguide__header">
                <h1 class="styleguide__title">Garage44 Common</h1>
                <ThemeToggle />
            </div>
            <ul class="styleguide__nav-list">
                <li>
                    <button
                        class={`styleguide__nav-link ${isComponentsRoute ? 'active' : ''}`}
                        onClick={() => {
                            $s.currentRoute = '/components'
                            route('/components')
                        }}
                    >
                        Components
                    </button>
                    {isComponentsRoute && (
                        <ul class={`styleguide__submenu ${isComponentsRoute ? 'open' : ''}`}>
                            {components.map(componentName => {
                                const id = componentName.toLowerCase().replaceAll(/\s+/g, '-')
                                return (
                                    <li key={id}>
                                        <button
                                            class={`styleguide__submenu-item ${activeComponent === id ? 'active' : ''}`}
                                            onClick={() => scrollToComponent(componentName)}
                                        >
                                            {componentName}
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </li>
                <li>
                    <button
                        class={`styleguide__nav-link ${$s.currentRoute === '/tokens' ? 'active' : ''}`}
                        onClick={() => {
                            $s.currentRoute = '/tokens'
                            route('/tokens')
                        }}
                    >
                        Design Tokens
                    </button>
                </li>
            </ul>
        </nav>
    )
}