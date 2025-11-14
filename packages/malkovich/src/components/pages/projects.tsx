import {MarkdownPage} from '../markdown'

export const Projects = () => {
    // Load workspace README.md for projects route
    const readmePath = 'README.md'
    return <MarkdownPage filePath={readmePath} />
}
