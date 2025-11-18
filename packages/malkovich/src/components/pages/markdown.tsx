import {MarkdownPage} from '../markdown'

interface MarkdownProps {
    path?: string
}

export const Markdown = ({path}: MarkdownProps) => {
    /*
     * path prop from router contains the route path (e.g., "/packages/expressio/README.md")
     * Convert to workspace-relative file path
     */
    const routePath = path || window.location.pathname.slice(1)

    // Don't handle root path - that should be handled by Home component
    if (!routePath || routePath === '' || routePath === '/') {
        return null
    }

    const markdownPath = routePath.endsWith('.md') || routePath.endsWith('.mdc') ?
        routePath :
        `${routePath}/README.md`
    return <MarkdownPage filePath={markdownPath} />
}
