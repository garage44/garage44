import {useState, useEffect} from 'preact/hooks'
import {MarkdownPage} from '../markdown'
import {fetchMarkdown} from '../../lib/markdown'

interface ProjectProps {
    projectName: string
}

export const Project = ({projectName}: ProjectProps) => {
    const [filePath, setFilePath] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    // Extract projectName from props (passed by Route component) or URL fallback
    const name = projectName || (() => {
        const pathParts = window.location.pathname.split('/').filter(Boolean)
        return pathParts[0] === 'projects' ? pathParts[1] : ''
    })()

    // Try index.md first, then index.mdc
    useEffect(() => {
        const tryLoad = async() => {
            if (!name) {
                setError('Project name is required')
                return
            }

            const indexMd = `packages/${name}/docs/index.md`
            const indexMdc = `packages/${name}/docs/index.mdc`

            // Try index.md first
            const mdContent = await fetchMarkdown(indexMd)
            if (mdContent) {
                setFilePath(indexMd)
                setError(null)
            } else {
                // Fall back to index.mdc
                const mdcContent = await fetchMarkdown(indexMdc)
                if (mdcContent) {
                    setFilePath(indexMdc)
                    setError(null)
                } else {
                    setError(`Documentation not found for ${name}`)
                }
            }
        }

        tryLoad()
    }, [name])

    if (error) {
        return <div class='styleguide-page error'>{error}</div>
    }

    if (!filePath) {
        return <div class='styleguide-page'>Loading...</div>
    }

    return <MarkdownPage filePath={filePath} />
}
