import { marked } from 'marked'

// Configure marked to preserve mermaid code blocks
marked.setOptions({
  breaks: true,
  gfm: true,
})

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
 * Example: ./packages/malkovich/docs/architecture/001-monorepo.md → /projects/malkovich/docs/architecture/001-monorepo
 * Example: ./001-monorepo.md (from packages/malkovich/docs/architecture/adr/index.md) → /projects/malkovich/docs/architecture/adr/001-monorepo
 */
export function convertLinksToLocalRoutes(markdown: string, basePath?: string): string {
  // Helper to resolve relative path against basePath
  const resolvePath = (relativeLink: string): string => {
    if (!basePath) return relativeLink

    // Remove filename from basePath to get directory
    const baseDir = basePath.includes('/')
      ? basePath.substring(0, basePath.lastIndexOf('/'))
      : ''

    // Resolve relative path
    const parts = baseDir ? baseDir.split('/') : []
    const linkParts = relativeLink.split('/').filter(p => p !== '' && p !== '.')

    for (const part of linkParts) {
      if (part === '..') {
        parts.pop()
      } else {
        parts.push(part)
      }
    }

    return parts.join('/')
  }

  // Convert relative links to absolute routes
  // Pattern: [text](./path/to/file.md) → [text](/path/to/file.md)
  let converted = markdown.replaceAll(
    /\[([^\]]+)\]\(\.\/([^)]+)\)/g,
    (match, text, link) => {
      // Resolve relative link against basePath
      const resolvedLink = resolvePath(link)

      // Handle package README links (old structure)
      // packages/{package}/README.md → /projects/{package}
      if (resolvedLink.match(/^packages\/([^/]+)\/README\.(md|mdc)$/)) {
        const packageName = resolvedLink.match(/^packages\/([^/]+)\//)[1]
        return `[${text}](/projects/${packageName})`
      }

      // Handle package docs links (new structure)
      // packages/{package}/docs/{section}/{file} → /projects/{package}/docs/{section}/{file}
      if (resolvedLink.match(/^packages\/([^/]+)\/docs\//)) {
        const pathAfterPackages = resolvedLink.replace(/^packages\/([^/]+)\//, '')
        const packageName = resolvedLink.match(/^packages\/([^/]+)\//)[1]
        const docsPath = pathAfterPackages.replace(/^docs\//, '')

        // If it's a directory or index file, link to section without filename
        if (docsPath.endsWith('/') || docsPath.endsWith('/index.md') || docsPath.endsWith('/index.mdc')) {
          const section = docsPath.replace(/\/$/, '').replace(/\/index\.(md|mdc)$/, '')
          return `[${text}](/projects/${packageName}/docs/${section})`
        }

        // Remove extension from file path
        const pathWithoutExt = docsPath.replace(/\.(md|mdc)$/, '')
        return `[${text}](/projects/${packageName}/docs/${pathWithoutExt})`
      }

      // Handle directory links (e.g., ./packages/expressio/)
      let route = resolvedLink
      if (!resolvedLink.endsWith('.md') && !resolvedLink.endsWith('.mdc')) {
        // If it's a directory, try index.md or index.mdc
        route = resolvedLink.endsWith('/') ? `${resolvedLink}index.md` : `${resolvedLink}/index.md`
      }

      // Convert to absolute route
      return `[${text}](/${route})`
    }
  )

  // Also handle links without ./ prefix (relative links)
  converted = converted.replaceAll(
    /\[([^\]]+)\]\(([^)]+\.(md|mdc))\)/g,
    (match, text, link) => {
      // If it's already absolute, keep it
      if (link.startsWith('/') || link.startsWith('http')) {
        return match
      }

      // If it's a relative link (doesn't start with packages/), resolve it
      let resolvedLink = link
      if (!link.startsWith('packages/') && basePath) {
        resolvedLink = resolvePath(link)
      }

      // Handle package README links
      if (resolvedLink.match(/^packages\/([^/]+)\/README\.(md|mdc)$/)) {
        const packageName = resolvedLink.match(/^packages\/([^/]+)\//)[1]
        return `[${text}](/projects/${packageName})`
      }

      // Handle package docs links
      if (resolvedLink.match(/^packages\/([^/]+)\/docs\//)) {
        const pathAfterPackages = resolvedLink.replace(/^packages\/([^/]+)\//, '')
        const packageName = resolvedLink.match(/^packages\/([^/]+)\//)[1]
        const docsPath = pathAfterPackages.replace(/^docs\//, '')

        // Remove extension from file path
        const pathWithoutExt = docsPath.replace(/\.(md|mdc)$/, '')
        return `[${text}](/projects/${packageName}/docs/${pathWithoutExt})`
      }

      // Otherwise, make it absolute
      return `[${text}](/${resolvedLink})`
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
 * Mermaid code blocks are preserved and will be rendered by the component
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

/**
 * Process HTML to prepare mermaid diagrams for rendering
 * Converts <pre><code class="language-mermaid">...</code></pre> to <div class="mermaid">...</div>
 */
export function prepareMermaidDiagrams(html: string): string {
  // Match mermaid code blocks: <pre><code class="language-mermaid">...</code></pre>
  const mermaidRegex = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g

  return html.replace(mermaidRegex, (match, diagramCode) => {
    // Decode HTML entities and trim whitespace
    const decoded = diagramCode
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim()

    // Generate unique ID for this diagram
    const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`

    // Return div that mermaid can render
    return `<div class="mermaid" id="${id}">${decoded}</div>`
  })
}
