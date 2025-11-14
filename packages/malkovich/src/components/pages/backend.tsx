import {useEffect} from 'preact/hooks'
import {route} from 'preact-router'

export const Backend = () => {
    // Redirect to new route structure
    useEffect(() => {
        route('/projects/malkovich/docs/rules/backend', true)
    }, [])
    return null
}
