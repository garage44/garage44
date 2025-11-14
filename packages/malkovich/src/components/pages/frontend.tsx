import {useEffect} from 'preact/hooks'
import {route} from 'preact-router'

export const Frontend = () => {
    // Redirect to new route structure
    useEffect(() => {
        route('/projects/malkovich/docs/rules/frontend', true)
    }, [])
    return null
}
