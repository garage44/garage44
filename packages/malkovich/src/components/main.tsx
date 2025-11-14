import {$s} from '@/app'
import {AppLayout, MenuItem, PanelMenu, Submenu, ThemeToggle} from '@garage44/common/components'
import {Router, Route, route} from 'preact-router'
import {useState, useEffect} from 'preact/hooks'
import {deepSignal} from 'deepsignal'
import {Components} from './pages/components'
import {Forms} from './pages/forms'
import {Tokens} from './pages/tokens'
import {Home} from './pages/home'
import {Frontend} from './pages/frontend'
import {Backend} from './pages/backend'
import {Markdown} from './pages/markdown'
import {Project} from './pages/project'
import {Projects} from './pages/projects'
import {Docs} from './pages/docs'

interface DocNode {
    children?: DocNode[]
    name: string
    path: string
    type: 'file' | 'directory'
}

interface PackageDocs {
    docs: DocNode[]
    index: string | null
    name: string
}

interface DocsStructure {
    packages: PackageDocs[]
}

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

// Local state for menu item collapsed states
// Default to collapsed (true) - will be updated based on active route
const menuState = deepSignal({
    home: true,
    projects: true,
})

export const Main = () => {
    const [activeComponent, setActiveComponent] = useState<string | null>(null)
    const [docsStructure, setDocsStructure] = useState<DocsStructure | null>(null)
    const isComponentsRoute = $s.currentRoute === '/components'

    // Determine current package and section from route
    const routeParts = $s.currentRoute.split('/').filter(Boolean)
    const currentPackage = routeParts[0] === 'projects' ? routeParts[1] : null
    const isProjectsRoute = $s.currentRoute === '/projects'
    const isProjectPage = routeParts[0] === 'projects' && routeParts.length >= 2 && currentPackage !== null
    const isDocsRoute = routeParts[0] === 'projects' && routeParts.length >= 3 && routeParts[2] === 'docs'
    const isHomeRoute = $s.currentRoute === '/'

    // Update collapsed state based on active route
    // Active items should be uncollapsed (false), inactive items should be collapsed (true)
    useEffect(() => {
        const isHomeActive = isHomeRoute || (isDocsRoute && currentPackage === 'malkovich')
        const isProjectsActive = isProjectsRoute || isProjectPage || (isDocsRoute && currentPackage !== 'malkovich')

        menuState.home = !isHomeActive
        menuState.projects = !isProjectsActive
    }, [isHomeRoute, isProjectsRoute, isProjectPage, isDocsRoute, currentPackage])

    // Extract current docs section path (e.g., "adr" or "adr/guide")
    // If we're on a file route, extract just the directory path
    const currentDocsSection = isDocsRoute && routeParts.length >= 4
        ? (() => {
            const pathParts = routeParts.slice(3)
            // If last part is a file (has extension), remove it to get directory path
            const lastPart = pathParts.at(-1)
            if (lastPart && (lastPart.endsWith('.md') || lastPart.endsWith('.mdc'))) {
                return pathParts.slice(0, -1).join('/')
            }
            return pathParts.join('/')
        })()
        : null

    // Fetch documentation structure on mount
    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const response = await fetch('/api/docs')
                if (response.ok) {
                    const data = await response.json()
                    setDocsStructure(data)
                }
            } catch (error) {
                console.error('Failed to fetch documentation structure:', error)
            }
        }
        fetchDocs()
    }, [])

    // Handle route changes
    const handleRouteChange = (e) => {
        $s.currentRoute = e.url
    }

    // Get current package docs
    const currentPackageDocs = docsStructure?.packages.find((p) => p.name === currentPackage)

    // Get malkovich docs for Home submenu
    const malkovichDocs = docsStructure?.packages.find((p) => p.name === 'malkovich')

    // Build docs submenu items
    const buildDocsSubmenu = (docs: DocNode[], packageName: string, basePath: string = ''): Array<{active: boolean; id: string; label: string; onClick: () => void}> => {
        const items: Array<{active: boolean; id: string; label: string; onClick: () => void}> = []

        for (const node of docs) {
            // Skip index files - they're served as directory index
            if (node.type === 'file' && (node.name === 'index.md' || node.name === 'index.mdc')) {
                continue
            }

            const fullPath = basePath ? `${basePath}/${node.name}` : node.name
            // For files, remove extension from route; for directories, keep as is
            const routePathWithoutExt = node.type === 'file'
                ? `/projects/${packageName}/docs/${basePath ? `${basePath}/` : ''}${node.name.replace(/\.(md|mdc)$/, '')}`
                : `/projects/${packageName}/docs/${fullPath}`
            const routePath = `/projects/${packageName}/docs/${fullPath}`
            // Check active state against both with and without extension (for backward compatibility)
            const isActive = $s.currentRoute === routePathWithoutExt || $s.currentRoute.startsWith(`${routePathWithoutExt}/`) || $s.currentRoute === routePath || $s.currentRoute.startsWith(`${routePath}/`)

            if (node.type === 'directory') {
                // For directories, link to index (route without filename)
                items.push({
                    active: isActive,
                    id: node.name,
                    label: node.name,
                    onClick: () => {
                        route(routePath)
                    },
                })
            } else {
                // For files, remove extension from route path
                const fileNameWithoutExt = node.name.replace(/\.(md|mdc)$/, '')
                const routePathWithoutExt = basePath
                    ? `/projects/${packageName}/docs/${basePath}/${fileNameWithoutExt}`
                    : `/projects/${packageName}/docs/${fileNameWithoutExt}`
                items.push({
                    active: isActive,
                    id: node.name,
                    label: fileNameWithoutExt,
                    onClick: () => {
                        route(routePathWithoutExt)
                    },
                })
            }
        }

        // Sort items alphabetically by label (A-Z)
        items.sort((a, b) => a.label.localeCompare(b.label, undefined, {sensitivity: 'base'}))

        return items
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
                    logoText="Garage44"
                    navigation={
                        <>
                            <MenuItem
                                active={isHomeRoute || (isDocsRoute && currentPackage === 'malkovich')}
                                collapsed={$s.panels.menu.collapsed}
                                href="/"
                                icon={menuState.home ? 'folder_plus_outline' : 'folder_minus_outline'}
                                iconType="info"
                                onClick={() => $s.currentRoute = '/'}
                                text="Home"
                            />
                            {!menuState.home && (isHomeRoute || (isDocsRoute && currentPackage === 'malkovich')) && malkovichDocs && malkovichDocs.docs.length > 0 && (
                                <Submenu
                                    collapsed={$s.panels.menu.collapsed}
                                    items={buildDocsSubmenu(malkovichDocs.docs, 'malkovich').map((item) => {
                                        // Check if this section is active (exact match) or if any nested child is active (starts with)
                                        const isDocsSectionActive = isDocsRoute && (currentDocsSection === item.id || (currentDocsSection && currentDocsSection.startsWith(item.id + '/')))
                                        const sectionNode = malkovichDocs.docs.find((d) => d.name === item.id && d.type === 'directory')
                                        const nestedItems: Array<{active: boolean; id: string; label: string; nested?: boolean; onClick: () => void}> = []

                                        // If this is the active docs section (or any child is active) and has children, add them as nested items
                                        if (isDocsSectionActive && sectionNode && sectionNode.children && sectionNode.children.length > 0) {
                                            const childrenItems = buildDocsSubmenu(sectionNode.children, 'malkovich', item.id).map((childItem) => ({
                                                ...childItem,
                                                nested: true,
                                            }))
                                            nestedItems.push(...childrenItems)
                                        }

                                        return {
                                            ...item,
                                            nested: true,
                                            // Add nested children if this section is active (or any child is active)
                                            ...(nestedItems.length > 0 && {children: nestedItems}),
                                        }
                                    })}
                                />
                            )}
                            {docsStructure && (() => {
                                // Filter out malkovich from projects listing
                                const packagesWithDocs = docsStructure.packages
                                    .filter((pkg) => pkg.index && pkg.name !== 'malkovich')
                                    .sort((a, b) => a.name.localeCompare(b.name, undefined, {sensitivity: 'base'}))
                                if (packagesWithDocs.length === 0) return null

                                return (
                                    <>
                                        <MenuItem
                                            active={isProjectsRoute || isProjectPage}
                                            collapsed={$s.panels.menu.collapsed}
                                            href="/projects"
                                            icon={menuState.projects ? 'folder_plus_outline' : 'folder_minus_outline'}
                                            iconType="info"
                                            onClick={() => {}}
                                            text="Projects"
                                        />
                                        {!menuState.projects && (
                                            <Submenu
                                                collapsed={$s.panels.menu.collapsed}
                                                items={packagesWithDocs.flatMap((pkg) => {
                                                    const isActive = currentPackage === pkg.name
                                                    const items = [{
                                                        active: isActive,
                                                        id: pkg.name,
                                                        label: pkg.name,
                                                        nested: true,
                                                        onClick: () => {
                                                            route(`/projects/${pkg.name}`)
                                                        },
                                                    }]

                                                    // If this package is active and has docs, add its docs submenu items
                                                    if (isActive && currentPackageDocs && currentPackageDocs.docs.length > 0) {
                                                        const docsItems = buildDocsSubmenu(currentPackageDocs.docs, pkg.name).map((item) => {
                                                            // Check if this section is active (exact match) or if any nested child is active (starts with)
                                                            const isDocsSectionActive = isDocsRoute && (currentDocsSection === item.id || (currentDocsSection && currentDocsSection.startsWith(item.id + '/')))
                                                            const sectionNode = currentPackageDocs.docs.find((d) => d.name === item.id && d.type === 'directory')
                                                            const nestedItems: Array<{active: boolean; id: string; label: string; nested?: boolean; onClick: () => void}> = []

                                                            // If this is the active docs section (or any child is active) and has children, add them as nested items
                                                            if (isDocsSectionActive && sectionNode && sectionNode.children && sectionNode.children.length > 0) {
                                                                const childrenItems = buildDocsSubmenu(sectionNode.children, pkg.name, item.id).map((childItem) => ({
                                                                    ...childItem,
                                                                    nested: true,
                                                                }))
                                                                nestedItems.push(...childrenItems)
                                                            }

                                                            return {
                                                                ...item,
                                                                nested: true,
                                                                // Add nested children if this section is active (or any child is active)
                                                                ...(nestedItems.length > 0 && {children: nestedItems}),
                                                            }
                                                        })
                                                        items.push(...docsItems)
                                                    }

                                                    return items
                                                })}
                                            />
                                        )}
                                    </>
                                )
                            })()}
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
                                    items={[...components]
                                        .sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}))
                                        .map((componentName) => {
                                            const id = componentName.toLowerCase().replaceAll(/\s+/g, '-')
                                            return {
                                                active: activeComponent === id,
                                                id,
                                                label: componentName,
                                                nested: true,
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
                    <Route path="/" component={Home} default />
                    <Route path="/projects" component={Projects} />
                    <Route path="/projects/:projectName/docs/:section/:filename?" component={Docs} />
                    <Route path="/projects/:projectName" component={Project} />
                    <Route path="/frontend" component={Frontend} />
                    <Route path="/backend" component={Backend} />
                    <Route path="/components" component={Components} />
                    <Route path="/forms" component={Forms} />
                    <Route path="/tokens" component={Tokens} />
                    <Route path="/:path+" component={Markdown} />
                </Router>
            </div>
        </AppLayout>
    )
}