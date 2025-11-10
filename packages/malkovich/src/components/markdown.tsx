import {useState, useEffect} from 'preact/hooks'
import {fetchMarkdown, convertLinksToLocalRoutes, renderMarkdown} from '../lib/markdown'
import './markdown.css'

interface MarkdownPageProps {
    path: string
}

export const MarkdownPage = ({path}: MarkdownPageProps) => {
    const [content, setContent] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadMarkdown = async () => {
            setLoading(true)
            setError(null)

            const markdown = await fetchMarkdown(path)

            if (markdown) {
                const converted = convertLinksToLocalRoutes(markdown, path)
                setContent(converted)
            } else {
                setError('File not found')
            }
            setLoading(false)
        }
        loadMarkdown()
    }, [path])

    if (loading) {
        return <div class="styleguide-page">Loading...</div>
    }

    if (error) {
        return <div class="styleguide-page error">{error}</div>
    }

    const html = renderMarkdown(content)

    return (
        <div class="styleguide-page">
            <div class="c-markdown-page" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
}
