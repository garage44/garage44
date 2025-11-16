import {$s} from '@/app'
import {AppLayout, MenuItem, PanelMenu, Submenu, ThemeToggle} from '@garage44/common/components'
import {Router, Route, route} from 'preact-router'
import {useEffect} from 'preact/hooks'
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

// Map package names to icons
const packageIcons: Record<string, string> = {
    bunchy: 'cog_outline',
    common: 'settings',
    expressio: 'translate',
    malkovich: 'viewlist',
    pyrite: 'webcam',
}

// Local state for menu item collapsed states per package
// Default to collapsed (true) - will be updated based on active route
const menuState = deepSignal<Record<string, boolean>>({})

// Component state - defined outside component to prevent re-creation on each render
const state = deepSignal({
    activeComponent: null as string | null,
    docsStructure: null as DocsStructure | null,
})

export const Main = () => {
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
        if (state.docsStructure) {
            const packagesWithDocs = state.docsStructure.packages
                .filter((pkg) => pkg.index)
            
            for (const pkg of packagesWithDocs) {
                const isPackageActive = currentPackage === pkg.name && (isProjectPage || isDocsRoute)
                // Initialize if not set, then update based on active state
                if (menuState[pkg.name] === undefined) {
                    menuState[pkg.name] = true // Default to collapsed
                }
                // If this package is active, uncollapse it; otherwise keep current state
                if (isPackageActive) {
                    menuState[pkg.name] = false
                }
            }
        }
    }, [isProjectsRoute, isProjectPage, isDocsRoute, currentPackage, state.docsStructure])

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
                    state.docsStructure = data
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

    // Build docs submenu items with nested structure
    type SubmenuItem = {
        active: boolean
        children?: SubmenuItem[]
        id: string
        label: string
        nested?: boolean
        onClick: () => void
    }
    const buildDocsSubmenu = (docs: DocNode[], packageName: string, basePath: string = ''): SubmenuItem[] => {
        const items: SubmenuItem[] = []

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
                    state.activeComponent = section.id
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
                        state.docsStructure ? (() => {
                            // Include all packages with docs, including malkovich
                            const packagesWithDocs = state.docsStructure.packages
                                .filter((pkg) => pkg.index)
                                .toSorted((a, b) => a.name.localeCompare(b.name, undefined, {sensitivity: 'base'}))
                            if (packagesWithDocs.length === 0) return null

                            return (
                                <>
                                    {packagesWithDocs.map((pkg) => {
                                        const isActive = currentPackage === pkg.name && (isProjectPage || isDocsRoute)
                                        const packageDocs = state.docsStructure.packages.find((p) => p.name === pkg.name)
                                        const isCollapsed = menuState[pkg.name] !== false // Default to collapsed if not set
                                        const iconName = packageIcons[pkg.name] || 'folder_plus_outline'

                                        // Build docs submenu items if this package has docs
                                        let docsSubmenuItems: SubmenuItem[] | undefined
                                        if (packageDocs && packageDocs.docs.length > 0) {
                                            docsSubmenuItems = buildDocsSubmenu(packageDocs.docs, pkg.name).map((item) => {
                                                // Check if this section is active (exact match) or if any nested child is active (starts with)
                                                const isDocsSectionActive = isDocsRoute && currentPackage === pkg.name && (currentDocsSection === item.id || (currentDocsSection && currentDocsSection.startsWith(item.id + '/')))
                                                const sectionNode = packageDocs.docs.find((d) => d.name === item.id && d.type === 'directory')
                                                const nestedItems: SubmenuItem[] = []

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
                                        }

                                        return (
                                            <div key={pkg.name}>
                                                <MenuItem
                                                    active={isActive}
                                                    collapsed={$s.panels.menu.collapsed}
                                                    href={`/projects/${pkg.name}`}
                                                    icon={iconName}
                                                    iconType="info"
                                                    onClick={() => {
                                                        // Toggle collapsed state
                                                        menuState[pkg.name] = !isCollapsed
                                                    }}
                                                    text={pkg.name}
                                                />
                                                {!isCollapsed && docsSubmenuItems && docsSubmenuItems.length > 0 && (
                                                    <Submenu
                                                        collapsed={$s.panels.menu.collapsed}
                                                        items={docsSubmenuItems}
                                                    />
                                                )}
                                            </div>
                                        )
                                    })}
                                </>
                            )
                        })() : null
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