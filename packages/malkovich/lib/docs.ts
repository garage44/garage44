import {readdir, stat} from 'fs/promises'
import {join} from 'path'
import {extractWorkspacePackages} from './workspace'

export interface DocNode {
    name: string
    path: string
    type: 'file' | 'directory'
    children?: DocNode[]
}

export interface PackageDocs {
    name: string
    index: string | null
    docs: DocNode[]
}

export interface DocsStructure {
    packages: PackageDocs[]
}

/**
 * Discover documentation structure for a single package
 */
export async function discoverPackageDocs(
    workspaceRoot: string,
    packageName: string
): Promise<{index: string | null; docs: DocNode[]}> {
    const docsDir = join(workspaceRoot, 'packages', packageName, 'docs')

    // Check if docs directory exists
    try {
        const stats = await stat(docsDir)
        if (!stats.isDirectory()) {
            return {index: null, docs: []}
        }
    } catch {
        return {index: null, docs: []}
    }

    // Check for index.md or index.mdc
    let index: string | null = null
    const indexMd = join(docsDir, 'index.md')
    const indexMdc = join(docsDir, 'index.mdc')

    try {
        await stat(indexMd)
        index = `packages/${packageName}/docs/index.md`
    } catch {
        try {
            await stat(indexMdc)
            index = `packages/${packageName}/docs/index.mdc`
        } catch {
            // No index file
        }
    }

    // Recursively scan docs directory
    const docs = await scanDirectory(docsDir, `packages/${packageName}/docs`)

    return {index, docs}
}

/**
 * Recursively scan a directory for markdown files
 */
async function scanDirectory(dirPath: string, relativePath: string): Promise<DocNode[]> {
    const nodes: DocNode[] = []

    try {
        const entries = await readdir(dirPath, {withFileTypes: true})

        // Separate directories and files, sort them
        const dirs: typeof entries = []
        const files: typeof entries = []

        for (const entry of entries) {
            // Skip hidden files
            if (entry.name.startsWith('.')) {
                continue
            }

            if (entry.isDirectory()) {
                dirs.push(entry)
            } else if (entry.isFile()) {
                // Only include markdown files
                if (entry.name.endsWith('.md') || entry.name.endsWith('.mdc')) {
                    // Skip index files (they're served as directory index)
                    if (entry.name === 'index.md' || entry.name === 'index.mdc') {
                        continue
                    }
                    files.push(entry)
                }
            }
        }

        // Sort: directories first, then alphabetically
        dirs.sort((a, b) => a.name.localeCompare(b.name))
        files.sort((a, b) => a.name.localeCompare(b.name))

        // Process directories
        for (const dir of dirs) {
            const dirFullPath = join(dirPath, dir.name)
            const dirRelativePath = `${relativePath}/${dir.name}`
            const children = await scanDirectory(dirFullPath, dirRelativePath)

            nodes.push({
                name: dir.name,
                path: dirRelativePath,
                type: 'directory',
                children,
            })
        }

        // Process files
        for (const file of files) {
            nodes.push({
                name: file.name,
                path: `${relativePath}/${file.name}`,
                type: 'file',
            })
        }
    } catch (error) {
        // Directory doesn't exist or can't be read
        console.warn(`[docs] Failed to scan directory ${dirPath}:`, error)
    }

    return nodes
}

/**
 * Discover documentation structure for all packages
 */
export async function discoverAllPackages(workspaceRoot: string): Promise<DocsStructure> {
    const packages = extractWorkspacePackages(workspaceRoot)
    const packageDocs: PackageDocs[] = []

    for (const pkg of packages) {
        const {index, docs} = await discoverPackageDocs(workspaceRoot, pkg)
        packageDocs.push({
            name: pkg,
            index,
            docs,
        })
    }

    return {packages: packageDocs}
}
