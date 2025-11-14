import {useState, useEffect} from 'preact/hooks'
import {MarkdownPage} from '../markdown'
import {fetchMarkdown} from '../../lib/markdown'

interface DocsProps {
    projectName?: string
    section?: string
    filename?: string
}

export const Docs = ({projectName, section, filename}: DocsProps) => {
    const [filePath, setFilePath] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [notFound, setNotFound] = useState<boolean>(false)

    // Extract from route if props not provided (preact-router fallback)
    const pathParts = window.location.pathname.split('/').filter(Boolean)
    const pkg = projectName || (pathParts[0] === 'projects' ? pathParts[1] : '')
    const sec = section || (pathParts[2] === 'docs' ? pathParts[3] : '')
    const file = filename || (pathParts[2] === 'docs' && pathParts[4] ? pathParts[4] : '')

    useEffect(() => {
        const tryLoad = async () => {
            setLoading(true)
            setNotFound(false)

            if (file) {
                // Specific file requested - try with and without extension
                const fileWithMd = file.endsWith('.md') || file.endsWith('.mdc') ? file : `${file}.md`
                const fileWithMdc = file.endsWith('.md') || file.endsWith('.mdc') ? file : `${file}.mdc`

                const mdPath = `packages/${pkg}/docs/${sec}/${fileWithMd}`
                const mdContent = await fetchMarkdown(mdPath)
                if (mdContent) {
                    setFilePath(mdPath)
                    setLoading(false)
                    return
                }

                const mdcPath = `packages/${pkg}/docs/${sec}/${fileWithMdc}`
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
                // No filename - section might be a file (without extension) or a directory
                // First try section as a file (with .md or .mdc extension)
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

                // Otherwise, try index.md first, then index.mdc (treating section as directory)
                const indexMd = `packages/${pkg}/docs/${sec}/index.md`
                const indexMdc = `packages/${pkg}/docs/${sec}/index.mdc`

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

                // Neither index file exists
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
        return <div class="styleguide-page">Loading...</div>
    }

    if (notFound) {
        return (
            <div class="styleguide-page">
                <h1>Documentation Not Found</h1>
                <p>No index file found for <code>{pkg}/docs/{sec}</code></p>
                <p>Expected: <code>packages/{pkg}/docs/{sec}/index.md</code> or <code>packages/{pkg}/docs/{sec}/index.mdc</code></p>
            </div>
        )
    }

    if (!filePath) {
        return <div class="styleguide-page">Loading...</div>
    }

    return <MarkdownPage filePath={filePath} />
}
