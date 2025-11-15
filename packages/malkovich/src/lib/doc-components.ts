/**
 * Component registry for documentation pages
 * Maps doc paths to component imports
 */
// Import components from common/docs using relative paths with explicit .tsx extension
import {Tokens} from '../../../common/docs/tokens.tsx'
import {Components} from '../../../common/docs/components.tsx'
import {Forms} from '../../../common/docs/forms.tsx'

// Map doc paths to component exports
// Path format: packages/{package}/docs/{section} or packages/{package}/docs/{file}.tsx
export const docComponents: Record<string, () => JSX.Element> = {
    'packages/common/docs/tokens': Tokens,
    'packages/common/docs/tokens.tsx': Tokens,
    'packages/common/docs/components': Components,
    'packages/common/docs/components.tsx': Components,
    'packages/common/docs/forms': Forms,
    'packages/common/docs/forms.tsx': Forms,
}


/**
 * Get a component for a given doc path
 */
export function getDocComponent(path: string): (() => JSX.Element) | null {
    // Try exact match first (with extension)
    if (docComponents[path]) {
        return docComponents[path]
    }

    // Remove file extension if present
    const pathWithoutExt = path.replace(/\.(md|mdc|tsx)$/, '')

    // Try match without extension
    if (docComponents[pathWithoutExt]) {
        return docComponents[pathWithoutExt]
    }

    // Try without packages/ prefix
    const pathWithoutPackages = pathWithoutExt.replace(/^packages\//, '')
    if (docComponents[pathWithoutPackages]) {
        return docComponents[pathWithoutPackages]
    }

    return null
}
