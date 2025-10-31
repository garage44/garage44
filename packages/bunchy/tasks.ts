import {broadcast, settings} from './index.ts'
import {Task} from './task.ts'
import fs from 'fs-extra'
import {Glob} from 'bun'
import path from 'path'
import template from 'lodash.template'
import {throttle} from '@garage44/common/lib/utils'
import {watch} from 'fs'
import {bundle} from 'lightningcss'

const debounce = {options: {trailing: true}, wait: 1000}

/**
 * Normalizes sourcemap paths to be relative to the public directory
 * @param map - The sourcemap buffer from Lightning CSS
 * @param sourceFileDir - The directory of the source entry file
 * @param publicDir - The public output directory
 * @returns Normalized sourcemap as a string
 */
function normalizeSourceMap(map: Uint8Array, sourceFileDir: string, publicDir: string): string {
    const sourceMapObj = JSON.parse(Buffer.from(map).toString())

    // Normalize source paths to be relative to public directory
    if (sourceMapObj.sources) {
        sourceMapObj.sources = sourceMapObj.sources.map((source: string) => {
            // Source paths from Lightning CSS are relative to the input file or absolute without leading /
            // Resolve them to absolute paths first, then make relative to public dir
            let absolutePath: string
            if (path.isAbsolute(source)) {
                absolutePath = source
            } else if (source.startsWith('home/')) {
                // Missing leading slash
                absolutePath = '/' + source
            } else {
                // Relative path - resolve from the source file location
                absolutePath = path.resolve(sourceFileDir, source)
            }
            return path.relative(publicDir, absolutePath)
        })
    }

    return JSON.stringify(sourceMapObj, null, 2)
}

const runner = {
    assets: throttle(async() => {
        const result = await tasks.assets.start()
        if (settings.reload_ignore.includes('/tasks/assets')) {
            return
        }
        broadcast('/tasks/assets', result || {}, 'POST')
    }, debounce.wait, debounce.options),
    code_frontend: throttle(async() => {
        const {filename, size} = await tasks.code_frontend.start({minify: false, sourcemap: true})
        if (settings.reload_ignore.includes('/tasks/code_frontend')) {
            return
        }
        broadcast('/tasks/code_frontend', {
            filename,
            publicPath: path.relative(settings.dir.workspace, settings.dir.public),
            size,
        }, 'POST')
    }, debounce.wait, debounce.options),
    html: throttle(async() => {
        const {filename, size} = await tasks.html.start({minify: false})
        if (settings.reload_ignore.includes('/tasks/html')) {
            return
        }
        broadcast('/tasks/html', {
            filename,
            publicPath: path.relative(settings.dir.workspace, settings.dir.public),
            size,
        }, 'POST')
    }, debounce.wait, debounce.options),
    styles: {
        app: throttle(async() => {
            const [appResult, componentsResult] = await Promise.all([
                tasks.stylesApp.start({minify: false, sourcemap: true}),
                tasks.stylesComponents.start({minify: false, sourcemap: true}),
            ])

            // Broadcast both messages since both stylesheets were rebuilt
            if (!settings.reload_ignore.includes('/tasks/styles/app')) {
                broadcast('/tasks/styles/app', {
                    filename: appResult.filename,
                    publicPath: path.relative(settings.dir.workspace, settings.dir.public),
                    size: appResult.size,
                }, 'POST')
            }

            if (!settings.reload_ignore.includes('/tasks/styles/components')) {
                broadcast('/tasks/styles/components', {
                    filename: componentsResult.filename,
                    publicPath: path.relative(settings.dir.workspace, settings.dir.public),
                    size: componentsResult.size,
                }, 'POST')
            }
        }, debounce.wait, debounce.options),
        components: throttle(async() => {
            const {filename, size} = await tasks.stylesComponents.start({minify: false, sourcemap: true})
            if (settings.reload_ignore.includes('/tasks/styles/components')) {
                return
            }
            broadcast('/tasks/styles/components', {
                filename,
                publicPath: path.relative(settings.dir.workspace, settings.dir.public),
                size,
            }, 'POST')
        }, debounce.wait, debounce.options),
    },
}

// Add this interface before the tasks declaration
interface Tasks {
    [key: string]: Task
    assets: Task
    build: Task
    clean: Task
    code_frontend: Task
    dev: Task
    html: Task
    styles: Task
    stylesApp: Task
    stylesComponents: Task
}

// Update the tasks declaration
const tasks: Tasks = {} as Tasks


tasks.assets = new Task('assets', async function taskAssets() {
    await fs.ensureDir(path.join(settings.dir.public, 'fonts'))
    await fs.ensureDir(path.join(settings.dir.public, 'img'))

    const copyOperations = [
        // Copy fonts from common package (shared across all projects)
        {
            from: path.join(settings.dir.common, 'fonts'),
            to: path.join(settings.dir.public, 'fonts'),
        },
        // Copy images from common package (shared placeholder avatars)
        {
            from: path.join(settings.dir.common, 'assets', 'img'),
            to: path.join(settings.dir.public, 'img'),
        },
        // Copy local assets if they exist (app-specific images)
        {
            from: path.join(settings.dir.assets, 'img'),
            to: path.join(settings.dir.public, 'img'),
        },
    ]

    // Execute copy operations, skipping if source doesn't exist
    for (const operation of copyOperations) {
        try {
            await fs.copy(operation.from, operation.to)
        } catch (error) {
            // Skip if source directory doesn't exist
            const errorCode = error.code
            if (errorCode !== 'ENOENT') {
                throw error
            }
        }
    }
})


tasks.build = new Task('build', async function taskBuild({minify = false, sourcemap = false} = {}) {
    await tasks.clean.start()
    await Promise.all([
        tasks.assets.start(),
        tasks.html.start({minify}),
        tasks.code_frontend.start({minify, sourcemap}),
        tasks.styles.start({minify, sourcemap}),
    ])
})


tasks.clean = new Task('clean', async function taskClean() {
    await fs.rm(settings.dir.public, {force: true, recursive: true})
    await fs.mkdirp(settings.dir.public)
})


tasks.code_frontend = new Task('code:frontend', async function taskCodeFrontend({minify = false, sourcemap = false} = {}) {
    try {
        const result = await Bun.build({
            define: {
                'process.env.APP_VERSION': `'${process.env.APP_VERSION || '2.0.0'}'`,
                'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
            },
            entrypoints: ['src/app.ts'],
            format: 'esm',
            jsx: {
                factory: 'h',
                importSource: 'preact',
                runtime: 'classic',
            },
            minify: {
                identifiers: false,
                syntax: minify,
                whitespace: minify,
            },
            naming: `[dir]/[name].${settings.buildId}.[ext]`,
            outdir: settings.dir.public,
            sourcemap: process.env.NODE_ENV === 'production' ? 'none' : 'linked',
        })

        if (!result.success) {
            // Broadcast error to client
            broadcast('/tasks/error', {
                details: result.logs,
                error: 'Build failed',
                task: 'code:frontend',
                timestamp: new Date().toISOString(),
            }, 'POST')
            return
        }
    } catch (error) {
        // oxlint-disable-next-line no-console
        console.error(error)
        // Broadcast error to client
        broadcast('/tasks/error', {
            details: error.stack || error.toString(),
            error: error.message || 'Unknown build error',
            task: 'code:frontend',
            timestamp: new Date().toISOString(),
        }, 'POST')
        return
    }

    const filename = `app.${settings.buildId}.js`
    return {
        filename,
        size: (await fs.readFile(path.join(settings.dir.public, filename))).length,
    }
})


tasks.dev = new Task('dev', async function taskDev({minify = false, sourcemap = true} = {}) {
    await tasks.clean.start()
    await tasks.build.start({minify, sourcemap})

    watch(settings.dir.common, {recursive: true}, (event, filename) => {
        const extension = path.extname(filename)
        if (extension === '.ts' || extension === '.tsx') {
            runner.code_frontend()
        } else if (extension === '.css') {
            runner.styles.components()
        }
    })

    watch(settings.dir.src, {recursive: true}, (event, filename) => {
        const extension = path.extname(filename)

        if (filename.startsWith('assets/')) {
            runner.assets()
        } else if (extension === '.ts' || extension === '.tsx') {
            runner.code_frontend()
        } else if (filename === 'index.html') {
            runner.html()
        } else if (extension === '.css') {
            // This is a temporary file for the components CSS, so we don't need to process it
            if (filename === 'components.css') {
                return
            }
            // Differentiate between app-level and component-level CSS files
            if (filename.startsWith('css/')) {
                // App-level styles (src/css/*.css)
                runner.styles.app()
            } else if (filename.startsWith('components/')) {
                // Component styles (src/components/**/*.css)
                runner.styles.components()
            } else {
                // Default to app for other CSS files
                runner.styles.app()
            }
        }
    })
})


tasks.html = new Task('html', async function taskHtml() {
    const indexFile = await fs.readFile(path.join(settings.dir.src, 'index.html'))
    const html = template(indexFile)({settings})
    const filename = 'index.html'
    await fs.writeFile(path.join(settings.dir.public, filename), html)
    return {filename, size: html.length}
})


tasks.styles = new Task('styles', async function taskStyles({minify = false, sourcemap = false} = {}) {
    const actions = [
        tasks.stylesApp.start({minify, sourcemap}),
        tasks.stylesComponents.start({minify, sourcemap}),
    ]

    const res = await Promise.all(actions)
    return {size: res.reduce((total, result) => total + result.size, 0)}
})


tasks.stylesApp = new Task('styles:app', async function taskStylesApp({minify, sourcemap}) {
    const filename = `app.${settings.buildId}.css`
    const appCssPath = path.join(settings.dir.src, 'css', 'app.css')

    try {
        const {code, map} = bundle({
            filename: appCssPath,
            minify,
            sourceMap: sourcemap,
        })

        let finalCSS = code.toString()
        if (map && sourcemap) {
            finalCSS += `\n/*# sourceMappingURL=${filename}.map */`
        }

        await fs.writeFile(path.join(settings.dir.public, filename), finalCSS)

        // Write source map if generated
        if (map && sourcemap) {
            const normalizedMap = normalizeSourceMap(map, path.dirname(appCssPath), settings.dir.public)
            await fs.writeFile(path.join(settings.dir.public, `${filename}.map`), normalizedMap)
        }

        return {filename, size: finalCSS.length}

    } catch (error) {
        console.error(error)
        // Broadcast error to client
        broadcast('/tasks/error', {
            details: error.stack || error.toString(),
            error: error.message || 'CSS build failed',
            task: 'styles:app',
            timestamp: new Date().toISOString(),
        }, 'POST')
        return
    }
})


tasks.stylesComponents = new Task('styles:components', async function taskStylesComponents({minify, sourcemap}) {
    // Create a temporary components entry file that imports all component CSS files
    // Bun's Glob handles multiple patterns by creating separate instances
    const glob1 = new Glob('**/*.css')
    const glob2 = new Glob('**/*.css')

    const imports1 = Array.from(glob1.scanSync(settings.dir.common)).map((f) => path.join(settings.dir.common, f))
    const imports2 = Array.from(glob2.scanSync(settings.dir.components)).map((f) => path.join(settings.dir.components, f))

    const allImports = [...imports1, ...imports2]

    // Create the components entry file content using absolute paths
    const componentImports = allImports.map((importFile) => {
        return `@import "${importFile}";`
    })

    const entryContent = componentImports.join('\n')
    const entryFile = path.join(settings.dir.src, 'components.css')

    // Ensure the src directory exists
    await fs.ensureDir(path.dirname(entryFile))

    // Write the temporary entry file to src dir
    await fs.writeFile(entryFile, entryContent, 'utf8')
    const filename = `components.${settings.buildId}.css`

    try {
        // Use Lightning CSS bundle API for proper @import resolution
        const {code, map} = bundle({
            filename: entryFile,
            minify,
            sourceMap: sourcemap,
        })

        // Add sourceMappingURL comment to the CSS
        let finalCSS = code.toString()
        if (map && sourcemap) {
            finalCSS += `\n/*# sourceMappingURL=${filename}.map */`
        }

        // Write the bundled CSS
        await fs.writeFile(path.join(settings.dir.public, filename), finalCSS)

        // Write source map if generated
        if (map && sourcemap) {
            const normalizedMap = normalizeSourceMap(map, path.dirname(entryFile), settings.dir.public)
            await fs.writeFile(path.join(settings.dir.public, `${filename}.map`), normalizedMap)
        }

        // Clean up temporary entry file
        await fs.rm(entryFile, {force: true})

        return {
            filename,
            size: finalCSS.length,
        }

    } catch (error) {
        console.error(error)
        // Broadcast error to client
        broadcast('/tasks/error', {
            details: error.stack || error.toString(),
            error: error.message || 'Component CSS build failed',
            task: 'styles:components',
            timestamp: new Date().toISOString(),
        }, 'POST')
        // Clean up temporary entry file on error
        await fs.rm(entryFile, {force: true})
        return
    }
})

export {tasks}