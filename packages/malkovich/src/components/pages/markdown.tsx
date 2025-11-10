import {MarkdownPage} from '../markdown'

interface MarkdownProps {
    path?: string
}

export const Markdown = ({path}: MarkdownProps) => {
    const markdownPath = path || window.location.pathname.slice(1)
    return <MarkdownPage path={markdownPath} />
}
