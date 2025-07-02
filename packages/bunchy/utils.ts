import * as sass from 'sass'
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

export function generateRandomId() {
    return Math.random().toString(36).substr(2, 9)
}

export function Scss(settings) {
    return async function(options) {
        const result = sass.compileString(options.data, {
            loadPaths: [
                settings.dir.src,
                settings.dir.scss,
                settings.dir.components,
                path.join(settings.dir.common, 'scss'),
            ],
            sourceMap: options.sourceMap,
            style: options.minify ? 'compressed' : 'expanded',
            url: new URL(`file://${options.file}`),
        })

        const styles = result.css

        if (result.sourceMap) {
            const sourceMap = result.sourceMap
            sourceMap.sources = sourceMap.sources.map(source => {
                if (source.startsWith('file://')) {
                    const filePath = new URL(source).pathname
                    return path.relative(path.dirname(options.outFile), filePath)
                }
                return source
            })

            await fs.writeFile(`${options.outFile}.map`, JSON.stringify(sourceMap), 'utf8')
            await fs.writeFile(options.outFile, styles + `\n/*# sourceMappingURL=${path.basename(options.outFile)}.map */`, 'utf8')
            return styles
        }

        await fs.writeFile(options.outFile, styles, 'utf8')
        return styles
    }
}
