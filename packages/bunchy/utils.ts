import archy from 'archy'
import fs from 'fs-extra'
import path from 'path'
import pc from 'picocolors'
import tildify from 'tildify'
import {logger} from './index.ts'

export const showConfig = function(settings) {
    const tree = {
        label: 'Bunchy Config:',
        nodes: [
            {
                label: pc.bold(pc.blue('Directories')),
                nodes: Object.entries(settings.dir).map(([k, dir]) => {
                    if (typeof dir === 'string') {
                        return {label: `${k.padEnd(10, ' ')} ${tildify(dir)}`}
                    } else if (Array.isArray(dir)) {
                        return {
                            label: 'extra',
                            nodes: dir.map((i) => tildify(i)),
                        }
                    }
                    return {label: `${k.padEnd(10, ' ')} ${tildify(String(dir))}`}
                }),
            },
            {
                label: pc.bold(pc.blue('Build Flags')),
                nodes: [
                    {label: `${'buildId'.padEnd(10, ' ')} ${settings.buildId}`},
                    {label: `${'minify'.padEnd(10, ' ')} ${settings.minify}`},
                    {label: `${'sourceMap'.padEnd(10, ' ')} ${settings.sourceMap}`},
                    {label: `${'version'.padEnd(10, ' ')} ${settings.version}`},
                ],
            },
        ],
    }

    logger.info('')
    archy(tree).split('\r').forEach((line) => logger.info(line))
}

export const generateRandomId = function() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function CssBundler(settings) {
    return async function(options) {
        try {
            // Read the entry file and process CSS imports manually
            const entryContent = await fs.readFile(options.entrypoint, 'utf8')
            const entryDir = path.dirname(options.entrypoint)

            // Extract @import statements and resolve them
            const importRegex = /@import\s+['"](.*?)['"];/g
            const imports = []
            let match

            while ((match = importRegex.exec(entryContent)) !== null) {
                const importPath = match[1]
                const resolvedPath = path.resolve(entryDir, importPath)
                imports.push(resolvedPath)
            }

            // Initialize CSS contents array
            let cssContents = []

            // Variables should only be included in app.css, not in components.css
            // This prevents duplication and improves performance

            // Read all imported CSS files
            const importedContents = await Promise.all(imports.map(async (importPath) => {
                try {
                    const content = await fs.readFile(importPath, 'utf8')
                    return `/* ${path.relative(settings.dir.workspace, importPath)} */\n${content}`
                } catch (error) {
                    console.warn(`Warning: Could not read CSS file ${importPath}:`, error.message)
                    return `/* Error loading ${importPath} */`
                }
            }))

            cssContents.push(...importedContents)

            // Add the entry file's own CSS content (excluding @import statements)
            const entryFileContent = entryContent.replace(/@import\s+['"](.*?)['"];/g, '').trim()
            if (entryFileContent) {
                cssContents.push(`/* ${path.relative(settings.dir.workspace, options.entrypoint)} */\n${entryFileContent}`)
            }

            // Combine all CSS content
            const combinedCss = cssContents.join('\n\n')

            // Write to the desired output file
            await fs.writeFile(options.outFile, combinedCss, 'utf8')

            return combinedCss
        } catch (error) {
            console.error('CSS bundling error:', error)
            throw error
        }
    }
}
