import { marked } from 'marked'

/**
 * Strip YAML frontmatter from markdown content
 * Frontmatter is metadata between --- delimiters at the start of the file
 */
function stripFrontmatter(markdown: string): string {
  // Match YAML frontmatter: starts with ---, ends with ---
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n/
  return markdown.replace(frontmatterRegex, '')
}

/**
 * Fetch markdown content from /api/markdown endpoint
 */
export async function fetchMarkdown(path: string): Promise<string | null> {
  try {
    // Validate path is not empty
    if (!path || path.trim() === '') {
      console.error('fetchMarkdown: path is empty')
      return null
    }

    const response = await fetch(`/api/markdown?path=${encodeURIComponent(path)}`)
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    const content = data.content || null

    // Strip frontmatter if present (common in .mdc files)
    return content ? stripFrontmatter(content) : null
  } catch (error) {
    console.error('Failed to fetch markdown:', error)
    return null
  }
}

/**
 * Convert relative links to local routes
 * Handles both old structure (packages/{package}/README.md) and new structure (packages/{package}/docs/{section})
 * Example: ./packages/expressio/README.md → /projects/expressio
 * Example: ./packages/malkovich/docs/adr/ADR-001.md → /projects/malkovich/docs/adr/ADR-001.md
 */
export function convertLinksToLocalRoutes(markdown: string, basePath?: string): string {
  // Convert relative links to absolute routes
  // Pattern: [text](./path/to/file.md) → [text](/path/to/file.md)
  let converted = markdown.replaceAll(
    /\[([^\]]+)\]\(\.\/([^)]+)\)/g,
    (match, text, link) => {
      // Handle package README links (old structure)
      // packages/{package}/README.md → /projects/{package}
      if (link.match(/^packages\/([^/]+)\/README\.(md|mdc)$/)) {
        const packageName = link.match(/^packages\/([^/]+)\//)[1]
        return `[${text}](/projects/${packageName})`
      }

      // Handle package docs links (new structure)
      // packages/{package}/docs/{section}/{file} → /projects/{package}/docs/{section}/{file}
      if (link.match(/^packages\/([^/]+)\/docs\//)) {
        const pathAfterPackages = link.replace(/^packages\/([^/]+)\//, '')
        const packageName = link.match(/^packages\/([^/]+)\//)[1]
        const docsPath = pathAfterPackages.replace(/^docs\//, '')

        // If it's a directory or index file, link to section without filename
        if (docsPath.endsWith('/') || docsPath.endsWith('/index.md') || docsPath.endsWith('/index.mdc')) {
          const section = docsPath.replace(/\/$/, '').replace(/\/index\.(md|mdc)$/, '')
          return `[${text}](/projects/${packageName}/docs/${section})`
        }

        return `[${text}](/projects/${packageName}/docs/${docsPath})`
      }

      // Handle directory links (e.g., ./packages/expressio/)
      let route = link
      if (!link.endsWith('.md') && !link.endsWith('.mdc')) {
        // If it's a directory, try index.md or index.mdc
        route = link.endsWith('/') ? `${link}index.md` : `${link}/index.md`
      }

      // Convert to absolute route
      return `[${text}](/${route})`
    }
  )

  // Also handle links without ./ prefix
  converted = converted.replaceAll(
    /\[([^\]]+)\]\(([^)]+\.(md|mdc))\)/g,
    (match, text, link) => {
      // If it's already absolute, keep it
      if (link.startsWith('/') || link.startsWith('http')) {
        return match
      }

      // Handle package README links
      if (link.match(/^packages\/([^/]+)\/README\.(md|mdc)$/)) {
        const packageName = link.match(/^packages\/([^/]+)\//)[1]
        return `[${text}](/projects/${packageName})`
      }

      // Handle package docs links
      if (link.match(/^packages\/([^/]+)\/docs\//)) {
        const pathAfterPackages = link.replace(/^packages\/([^/]+)\//, '')
        const packageName = link.match(/^packages\/([^/]+)\//)[1]
        const docsPath = pathAfterPackages.replace(/^docs\//, '')
        return `[${text}](/projects/${packageName}/docs/${docsPath})`
      }

      // Otherwise, make it absolute
      return `[${text}](/${link})`
    }
  )

  return converted
}

/**
 * Extract links from markdown for navigation
 */
export function extractLinks(markdown: string): Array<{ text: string; path: string }> {
  const links: Array<{ text: string; path: string }> = []
  const linkRegex = /\[([^\]]+)\]\(\.\/([^)]+)\)/g
  let match

  while ((match = linkRegex.exec(markdown)) !== null) {
    const [, text, link] = match
    let path = link

    // Handle directory links
    if (!link.endsWith('.md') && !link.endsWith('.mdc')) {
      path = link.endsWith('/') ? `${link}README.md` : `${link}/README.md`
    }

    links.push({ text, path })
  }

  return links
}

/**
 * Render markdown to HTML
 */
export function renderMarkdown(markdown: string): string {
  try {
    // marked.parse is the correct method
    return marked.parse(markdown)
  } catch (error) {
    console.error('Error rendering markdown:', error)
    // Fallback: return markdown as-is if parsing fails
    return markdown
  }
}
