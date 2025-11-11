import {useState, useEffect} from 'preact/hooks'
import {fetchMarkdown, convertLinksToLocalRoutes, renderMarkdown} from '../lib/markdown'


interface MarkdownPageProps {
    filePath: string
}

export const MarkdownPage = ({filePath}: MarkdownPageProps) => {
    const [content, setContent] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadMarkdown = async () => {
            setLoading(true)
            setError(null)

            // Ensure filePath is not empty - trim whitespace
            const trimmedPath = filePath?.trim() || ''
            if (!trimmedPath) {
                setError('Path is required')
                setLoading(false)
                return
            }

            const markdown = await fetchMarkdown(trimmedPath)

            if (markdown) {
                const converted = convertLinksToLocalRoutes(markdown, trimmedPath)
                setContent(converted)
            } else {
                setError('File not found')
            }
            setLoading(false)
        }
        loadMarkdown()
    }, [filePath])

    if (loading) {
        return <div class="styleguide-page">Loading...</div>
    }

    if (error) {
        return <div class="styleguide-page error">{error}</div>
    }

    const html = renderMarkdown(content)

    return <div class="c-markdown-page" dangerouslySetInnerHTML={{__html: html}} />
}
