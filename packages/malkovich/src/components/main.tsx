import {$s} from '@/app'
import {AppLayout, MenuItem, PanelMenu, Submenu, ThemeToggle} from '@garage44/common/components'
import {Router, Route, route} from 'preact-router'
import {useState, useEffect} from 'preact/hooks'
import {deepSignal} from 'deepsignal'
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

    // Update collapsed state based on active route
    // Active items should be uncollapsed (false), inactive items should be collapsed (true)
    useEffect(() => {
        const isProjectsActive = isProjectsRoute || isProjectPage || isDocsRoute

        menuState.projects = !isProjectsActive
    }, [isProjectsRoute, isProjectPage, isDocsRoute])

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
                // Add cache-busting query parameter to ensure fresh data
                const response = await fetch(`/api/docs?t=${Date.now()}`)
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

    // Build docs submenu items with nested structure
    const buildDocsSubmenu = (docs: DocNode[], packageName: string, basePath: string = ''): Array<{active: boolean; id: string; label: string; nested?: boolean; onClick: () => void; children?: Array<any>}> => {
        const items: Array<{active: boolean; id: string; label: string; nested?: boolean; onClick: () => void; children?: Array<any>}> = []

        for (const node of docs) {
            // Skip index files - they're served as directory index
            if (node.type === 'file' && (node.name === 'index.md' || node.name === 'index.mdc' || node.name === 'page.tsx')) {
                continue
            }

            const fullPath = basePath ? `${basePath}/${node.name}` : node.name
            // For files, remove extension from route and label; for directories, keep as is
            const fileNameWithoutExt = node.type === 'file'
                ? node.name.replace(/\.(md|mdc|tsx)$/, '')
                : node.name
            // Always remove extension from route (no .tsx in URLs)
            const routePathWithoutExt = node.type === 'file'
                ? `/projects/${packageName}/docs/${basePath ? `${basePath}/` : ''}${fileNameWithoutExt}`
                : `/projects/${packageName}/docs/${fullPath}`
            const routePath = `/projects/${packageName}/docs/${fullPath}`
            // Check active state against route without extension
            const isActive = $s.currentRoute === routePathWithoutExt || $s.currentRoute.startsWith(`${routePathWithoutExt}/`)

            if (node.type === 'directory') {
                // Recursively build children for directories
                const children = node.children && node.children.length > 0
                    ? buildDocsSubmenu(node.children, packageName, fullPath)
                    : undefined

                // Check if this directory or any of its children is active
                const isDocsSectionActive = isDocsRoute && (currentDocsSection === node.name || (currentDocsSection && currentDocsSection.startsWith(node.name + '/')))

                items.push({
                    active: isActive || isDocsSectionActive,
                    id: node.name,
                    label: node.name,
                    nested: true,
                    onClick: () => {
                        route(routePath)
                    },
                    // Only include children if this section is active (or any child is active)
                    ...(isDocsSectionActive && children && children.length > 0 && {children}),
                })
            } else {
                // For files, use name without extension for label and route (remove .tsx from route too)
                items.push({
                    active: isActive,
                    id: fileNameWithoutExt,
                    label: fileNameWithoutExt,
                    nested: true,
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
                            {docsStructure && (() => {
                                // Include all packages with docs, including malkovich
                                const packagesWithDocs = docsStructure.packages
                                    .filter((pkg) => pkg.index)
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
                                                items={packagesWithDocs.map((pkg) => {
                                                    const isActive = currentPackage === pkg.name
                                                    const packageDocs = docsStructure.packages.find((p) => p.name === pkg.name)

                                                    const packageItem: {
                                                        active: boolean
                                                        id: string
                                                        label: string
                                                        nested: boolean
                                                        onClick: () => void
                                                        children?: Array<{active: boolean; id: string; label: string; nested?: boolean; onClick: () => void; children?: any[]}>
                                                    } = {
                                                        active: isActive,
                                                        id: pkg.name,
                                                        label: pkg.name,
                                                        nested: true,
                                                        onClick: () => {
                                                            route(`/projects/${pkg.name}`)
                                                        },
                                                    }

                                                    // If this package is active and has docs, add its docs submenu items as children
                                                    if (isActive && packageDocs && packageDocs.docs.length > 0) {
                                                        const docsItems = buildDocsSubmenu(packageDocs.docs, pkg.name).map((item) => {
                                                            // Check if this section is active (exact match) or if any nested child is active (starts with)
                                                            const isDocsSectionActive = isDocsRoute && (currentDocsSection === item.id || (currentDocsSection && currentDocsSection.startsWith(item.id + '/')))
                                                            const sectionNode = packageDocs.docs.find((d) => d.name === item.id && d.type === 'directory')
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
                                                        packageItem.children = docsItems
                                                    }

                                                    return packageItem
                                                })}
                                            />
                                        )}
                                    </>
                                )
                            })()}
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
                    <Route path="/" component={Projects} default />
                    <Route path="/projects" component={Projects} />
                    <Route path="/projects/:projectName/docs/:section/:subsection/:filename?" component={Docs} />
                    <Route path="/projects/:projectName/docs/:section/:filename?" component={Docs} />
                    <Route path="/projects/:projectName/docs/*" component={Docs} />
                    <Route path="/projects/:projectName" component={Project} />
                    <Route path="/frontend" component={Frontend} />
                    <Route path="/backend" component={Backend} />
                    <Route path="/:path+" component={Markdown} />
                </Router>
            </div>
        </AppLayout>
    )
}