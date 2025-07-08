import {broadcast, settings, tooling} from './index.ts'
import {Task} from './task.ts'
import fs from 'fs-extra'
import {glob} from 'glob'
import path from 'path'
import template from 'lodash.template'
import {throttle} from '@garage44/common/lib/utils'
import {watch} from 'fs'

const debounce = {options: {trailing: true}, wait: 1000}

const runner = {
    assets: throttle(async() => {
        const result = await tasks.assets.start()
        if (settings.reload_ignore.includes('/tasks/assets')) return
        broadcast('/tasks/assets', result || {}, 'POST')
    }, debounce.wait, debounce.options),
    code_frontend: throttle(async() => {
        const {filename, size} = await tasks.code_frontend.start({minify: false, sourcemap: true})
        if (settings.reload_ignore.includes('/tasks/code_frontend')) return
        broadcast('/tasks/code_frontend', {
            filename,
            publicPath: path.relative(settings.dir.workspace, settings.dir.public),
            size,
        }, 'POST')
    }, debounce.wait, debounce.options),
    html: throttle(async() => {
        const {filename, size} = await tasks.html.start({minify: false})
        if (settings.reload_ignore.includes('/tasks/html')) return
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
            if (settings.reload_ignore.includes('/tasks/styles/components')) return
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
    assets: Task
    build: Task
    clean: Task
    code_frontend: Task
    dev: Task
    html: Task
    styles: Task
    stylesApp: Task
    stylesComponents: Task
    [key: string]: Task
}

// Update the tasks declaration
export const tasks: Tasks = {} as Tasks

tasks.assets = new Task('assets', async function() {
    await fs.ensureDir(path.join(settings.dir.public, 'fonts'))

    const actions = [
        fs.copy(path.join(settings.dir.assets, 'fonts'), path.join(settings.dir.public, 'fonts')),
        fs.copy(path.join(settings.dir.assets, 'img'), path.join(settings.dir.public, 'img')),
    ]

    await Promise.all(actions)
})

tasks.build = new Task('build', async function({minify = false, sourcemap = false} = {}) {
    await tasks.clean.start()
    await Promise.all([
        tasks.assets.start(),
        tasks.html.start({minify}),
        tasks.code_frontend.start({minify, sourcemap}),
        tasks.styles.start({minify, sourcemap}),
    ])
})

tasks.clean = new Task('clean', async function() {
    await fs.rm(path.join(settings.dir.workspace, 'app.js'), {force: true})
    await fs.rm(settings.dir.public, {force: true, recursive: true})
    await fs.mkdirp(settings.dir.public)
})

tasks.code_frontend = new Task('code:frontend', async function({minify = false, sourcemap = false} = {}) {
    try {
        const result = await Bun.build({
            define: {
                'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
            },
            entrypoints: ['src/app.ts'],
            format: 'esm',
            minify: {
                identifiers: false,
                syntax: minify,
                whitespace: minify,
            },
            naming: `[dir]/[name].${settings.buildId}.[ext]`,
            outdir: settings.dir.public,
            sourcemap: process.env.NODE_ENV === 'production' ? 'none' : 'inline',
        })
        if (!result.success) {
            // oxlint-disable-next-line no-console
            console.error(result.logs)
        }
    } catch (error) {
        // oxlint-disable-next-line no-console
        console.error(error)
    }

    const filename = `app.${settings.buildId}.js`
    return {
        filename,
        size: (await fs.readFile(path.join(settings.dir.public, filename))).length,
    }
})

tasks.dev = new Task('dev', async function({minify = false, sourcemap = true} = {}) {
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

tasks.html = new Task('html', async function() {
    const indexFile = await fs.readFile(path.join(settings.dir.src, 'index.html'))
    const html = template(indexFile)({settings})
    const filename = 'index.html'
    await fs.writeFile(path.join(settings.dir.public, filename), html)
    return {filename, size: html.length}
})

tasks.styles = new Task('styles', async function({minify = false, sourcemap = false} = {}) {
    const actions = [
        tasks.stylesApp.start({minify, sourcemap}),
        tasks.stylesComponents.start({minify, sourcemap}),
    ]

    const res = await Promise.all(actions)
    return {size: res.reduce((total, result) => total + result.size, 0)}
})

tasks.stylesApp = new Task('styles:app', async function({minify, sourcemap}) {
    const filename = `app.${settings.buildId}.css`
    try {
        const result = await Bun.build({
            entrypoints: [path.join(settings.dir.src, 'css', 'app.css')],
            minify,
            external: ["*.woff2"],
            sourcemap: sourcemap ? 'inline' : 'none',
          })


        let totalSize = 0
        for (const res of result.outputs) {
            await res.text()
            new Response(res)
            Bun.write(path.join(settings.dir.public, filename), res)
            totalSize += res.size
        }

        return {filename, size: totalSize}

    } catch (error) {
        console.error(error)
    }
})

tasks.stylesComponents = new Task('styles:components', async function({minify, sourcemap}) {
    // Create a temporary components entry file that imports all component CSS files
    const imports = await glob([
        path.join(settings.dir.common, '**', '*.css'),
        path.join(settings.dir.components, '**', '*.css'),
    ])

    const allImports = imports.flat()

    // Create the components entry file content
    const componentImports = allImports.map((f) => {
        // Use the absolute path directly since we're creating the entry file in public/
        // This avoids path resolution issues
        return `@import "${f}";`
    })

    const entryContent = componentImports.join('\n')
    const entryFile = path.join(settings.dir.public, 'components.css')

    // Ensure the public directory exists
    await fs.ensureDir(path.dirname(entryFile))

    // Write the temporary entry file to public dir (not src)
    await fs.writeFile(entryFile, entryContent, 'utf8')
    const filename = `components.${settings.buildId}.css`

    try {
        const result = await Bun.build({
            entrypoints: [entryFile],
            external: ["*.woff2"],
            minify,
            sourcemap: sourcemap ? 'inline' : 'none',
        })


        let totalSize = 0
        for (const res of result.outputs) {
            await res.text()
            new Response(res)
            Bun.write(path.join(settings.dir.public, filename), res)
            totalSize += res.size
        }
        // Clean up temporary entry file
        await fs.rm(entryFile, {force: true})
        return {filename, size: totalSize}

    } catch (error) {
        console.error(error)
    }
})
