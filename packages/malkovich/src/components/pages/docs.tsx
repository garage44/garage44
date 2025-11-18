import {useState, useEffect} from 'preact/hooks'
import {MarkdownPage} from '../markdown'
import {fetchMarkdown} from '../../lib/markdown'
import {getDocComponent} from '../../lib/doc-components'

interface DocsProps {
    filename?: string
    projectName?: string
    section?: string
}

export const Docs = ({filename, projectName, section}: DocsProps) => {
    const [filePath, setFilePath] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [notFound, setNotFound] = useState<boolean>(false)

    // Extract from route if props not provided (preact-router fallback)
    const pathParts = window.location.pathname.split('/').filter(Boolean)
    const pkg = projectName || (pathParts[0] === 'projects' ? pathParts[1] : '')

    /*
     * Extract the full path after /docs/ (handles nested directories like architecture/adr)
     * Parse directly from URL to handle any nesting level
     */
    let sec = section
    let file = filename

    if (pathParts[0] === 'projects' && pathParts[2] === 'docs') {
        // Get everything after 'docs'
        const docsPath = pathParts.slice(3)

        if (docsPath.length > 0) {
            const lastPart = docsPath[docsPath.length - 1]

            // If last part has .md, .mdc, or .tsx extension, it's definitely a file
            if (lastPart.endsWith('.md') || lastPart.endsWith('.mdc') || lastPart.endsWith('.tsx')) {
                file = lastPart
                sec = docsPath.slice(0, -1).join('/')
            } else {
                /*
                 * No file extension - treat entire path as section (directory)
                 * Will try index.md/index.mdc/page.tsx first, then try as file if that fails
                 */
                sec = docsPath.join('/')
                file = undefined
            }
        }
    }

    useEffect(() => {
        const tryLoad = async() => {
            setLoading(true)
            setNotFound(false)

            if (file) {
                // Check if it's a component file (.tsx)
                if (file.endsWith('.tsx')) {
                    const componentPath = sec ? `packages/${pkg}/docs/${sec}/${file}` : `packages/${pkg}/docs/${file}`
                    const docComponent = getDocComponent(componentPath)
                    if (docComponent) {
                        setFilePath(`component:${componentPath}`)
                        setLoading(false)
                        return
                    }
                    setFilePath('')
                    setNotFound(true)
                    setLoading(false)
                    return
                }

                // Markdown file - try with and without extension
                const fileWithMd = file.endsWith('.md') || file.endsWith('.mdc') ? file : `${file}.md`
                const fileWithMdc = file.endsWith('.md') || file.endsWith('.mdc') ? file : `${file}.mdc`

                const mdPath = sec ? `packages/${pkg}/docs/${sec}/${fileWithMd}` : `packages/${pkg}/docs/${fileWithMd}`
                const mdContent = await fetchMarkdown(mdPath)
                if (mdContent) {
                    setFilePath(mdPath)
                    setLoading(false)
                    return
                }

                const mdcPath = sec ? `packages/${pkg}/docs/${sec}/${fileWithMdc}` : `packages/${pkg}/docs/${fileWithMdc}`
                const mdcContent = await fetchMarkdown(mdcPath)
                if (mdcContent) {
                    setFilePath(mdcPath)
                    setLoading(false)
                    return
                }

                setFilePath('')
                setNotFound(true)
                setLoading(false)
            } else {
                /*
                 * No filename - section might be a directory, a markdown file, or a component file (without extension)
                 * Try component first (e.g., forms → forms.tsx), then markdown, then directory
                 */

                // First, try as component file (.tsx)
                const componentPath = `packages/${pkg}/docs/${sec}.tsx`
                const docComponent = getDocComponent(componentPath)
                if (docComponent) {
                    setFilePath(`component:${componentPath}`)
                    setLoading(false)
                    return
                }

                /*
                 * For paths with multiple parts, try last part as file first
                 * e.g., architecture/adr/004-preact-ws → try 004-preact-ws.md in architecture/adr/
                 */
                const secParts = sec.split('/')
                if (secParts.length > 1) {
                    const lastPart = secParts[secParts.length - 1]
                    const parentSec = secParts.slice(0, -1).join('/')

                    // Try component first
                    const nestedComponentPath = `packages/${pkg}/docs/${parentSec}/${lastPart}.tsx`
                    const nestedComponent = getDocComponent(nestedComponentPath)
                    if (nestedComponent) {
                        setFilePath(`component:${nestedComponentPath}`)
                        setLoading(false)
                        return
                    }

                    // Then try markdown
                    const fileMd = `packages/${pkg}/docs/${parentSec}/${lastPart}.md`
                    const fileMdc = `packages/${pkg}/docs/${parentSec}/${lastPart}.mdc`

                    const fileMdContent = await fetchMarkdown(fileMd)
                    if (fileMdContent) {
                        setFilePath(fileMd)
                        setLoading(false)
                        return
                    }

                    const fileMdcContent = await fetchMarkdown(fileMdc)
                    if (fileMdcContent) {
                        setFilePath(fileMdc)
                        setLoading(false)
                        return
                    }
                }

                // Try as directory (index.md/index.mdc/page.tsx)
                const indexMd = `packages/${pkg}/docs/${sec}/index.md`
                const indexMdc = `packages/${pkg}/docs/${sec}/index.mdc`
                const pageTsx = `packages/${pkg}/docs/${sec}/page.tsx`

                const mdContent = await fetchMarkdown(indexMd)
                if (mdContent) {
                    setFilePath(indexMd)
                    setLoading(false)
                    return
                }

                const mdcContent = await fetchMarkdown(indexMdc)
                if (mdcContent) {
                    setFilePath(indexMdc)
                    setLoading(false)
                    return
                }

                // Check for page.tsx component
                const pageComponent = getDocComponent(pageTsx)
                if (pageComponent) {
                    setFilePath(`component:${pageTsx}`)
                    setLoading(false)
                    return
                }

                // If no index found, try section as a markdown file (with .md or .mdc extension)
                const sectionMd = `packages/${pkg}/docs/${sec}.md`
                const sectionMdc = `packages/${pkg}/docs/${sec}.mdc`

                const sectionMdContent = await fetchMarkdown(sectionMd)
                if (sectionMdContent) {
                    setFilePath(sectionMd)
                    setLoading(false)
                    return
                }

                const sectionMdcContent = await fetchMarkdown(sectionMdc)
                if (sectionMdcContent) {
                    setFilePath(sectionMdc)
                    setLoading(false)
                    return
                }

                // Neither index file nor direct file exists
                setFilePath('')
                setNotFound(true)
                setLoading(false)
            }
        }

        if (pkg && sec) {
            tryLoad()
        } else {
            setLoading(false)
        }
    }, [pkg, sec, file])

    if (loading) {
        return <div class='styleguide-page'>Loading...</div>
    }

    if (notFound) {
        return (
            <div class='styleguide-page'>
                <h1>Documentation Not Found</h1>
                <p>
No index file found for
<code>
{pkg}
/docs/
{sec}
</code>
                </p>
                <p>
Expected:
<code>
packages/
{pkg}
/docs/
{sec}
/index.md
</code>
{' '}
or
<code>
packages/
{pkg}
/docs/
{sec}
/index.mdc
</code>
                </p>
            </div>
        )
    }

    if (!filePath) {
        return <div class='styleguide-page'>Loading...</div>
    }

    // Check if this is a component-based doc
    if (filePath.startsWith('component:')) {
        const componentPath = filePath.replace('component:', '')
        const Component = getDocComponent(componentPath)
        if (Component) {
            return <Component />
        }
        return (
            <div class='styleguide-page'>
                <h1>Component Not Found</h1>
                <p>
Component not found for path:
<code>{componentPath}</code>
                </p>
            </div>
        )
    }

    return <MarkdownPage filePath={filePath} />
}
