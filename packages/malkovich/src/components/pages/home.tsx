import {MarkdownPage} from '../markdown'

export const Home = () => {
    // Always load README.md from workspace root for home route
    const readmePath = 'README.md'
    return <MarkdownPage filePath={readmePath} />
}
