import {useEffect} from 'preact/hooks'
import {MarkdownPage} from '../markdown'

export const Home = () => {
    // Load malkovich docs index for home route
    const indexPath = 'packages/malkovich/docs/index.md'

    useEffect(() => {
        // Ensure we're loading the correct file
        console.log('[Home] Loading:', indexPath)
    }, [])

    return <MarkdownPage filePath={indexPath} />
}
