import {
    MessageData,
    WebSocketServerManager,
    createWebSocketServer,
} from '@garage44/common/lib/ws-server'
import {Scss, generateRandomId, showConfig} from './utils'
import {URL, fileURLToPath} from 'node:url'
import path from 'node:path'
import {tasks} from './tasks.ts'

const currentDir = fileURLToPath(new URL('.', import.meta.url))

// Keep a reference to the server manager for Bunchy-specific functionality
let serverManager: WebSocketServerManager | null = null

interface Settings {
    buildId: string
    dir: {
        assets: string
        bunchy: string
        common: string
        components: string
        public: string
        scss: string
        src: string
        workspace: string
    }
    reload_ignore: string[]
}

export const settings = {} as Settings
export const tooling = {} as {scss: unknown}

async function applySettings(config) {
    Object.assign(settings, {
        buildId: generateRandomId(),
        dir: {
            assets: path.resolve(path.join(config.workspace, 'src', 'assets')),
            bunchy: currentDir,
            common: config.common,
            components: path.resolve(path.join(config.workspace, 'src', 'components')),
            public: path.resolve(path.join(config.workspace, `public`)),
            scss: path.resolve(path.join(config.workspace, 'src', 'scss')),
            src: path.resolve(path.join(config.workspace, 'src')),
            workspace: config.workspace,
        },
        minify: config.minify,
        reload_ignore: config.reload_ignore,
        sourcemap: config.sourcemap,
        version: config.version,
    })
    tooling.scss = Scss(settings)

    showConfig(settings)
}

export async function bunchyService(server, config) {
    applySettings(config)

    // Create WebSocket server using the common implementation
    const {manager} = createWebSocketServer({
        path: '/bunchy',
        server, // Handle both Bun and Node.js server objects
    })

    // Store reference to the manager
    serverManager = manager

    await tasks.dev.start({minify: false, sourcemap: true})
    return server
}

export function bunchyArgs(yargs, config) {
    applySettings(config)

    yargs.option('minify', {
        default: false,
        description: '[Bunchy] Minify output',
        type: 'boolean',
    }).option('sourcemap', {
        default: true,
        description: '[Bunchy] Include source mapping',
        type: 'boolean',
    }).option('builddir', {
        default: '',
        describe: '[Bunchy] Directory to build to',
        type: 'string',
    }).command('build', '[Bunchy] build application', async(yargs) => {
        applySettings({...config, minify: yargs.argv.minify, sourcemap: yargs.argv.sourcemap})
        tasks.build.start({minify: true, sourcemap: true})
    }).command('code_backend', '[Bunchy] bundle backend javascript', (yargs) => {
        applySettings({...config, minify: yargs.argv.minify, sourcemap: yargs.argv.sourcemap})
        tasks.code_backend.start({minify: true, sourcemap: true})
    }).command('code_frontend', '[Bunchy] bundle frontend javascript', (yargs) => {
        applySettings({...config, minify: yargs.argv.minify, sourcemap: yargs.argv.sourcemap})
        tasks.code_frontend.start({minify: true, sourcemap: true})
    }).command('html', '[Bunchy] build html file', (yargs) => {
        applySettings({...config, minify: yargs.argv.minify, sourcemap: yargs.argv.sourcemap})
        tasks.html.start({minify: true, sourcemap: true})
    }).command('styles', '[Bunchy] bundle styles', (yargs) => {
        applySettings({...config, minify: yargs.argv.minify, sourcemap: yargs.argv.sourcemap})
        tasks.styles.start({minify: true, sourcemap: true})
    })

    return yargs
}

// For backward compatibility, re-export connections from the manager
export const connections = {
    add: (ws) => serverManager?.connections.add(ws),
    delete: (ws) => serverManager?.connections.delete(ws),
    has: (ws) => serverManager?.connections.has(ws),
    get size() { return serverManager?.connections.size || 0 },
    [Symbol.iterator]: function*() {
        if (!serverManager) return
        yield* serverManager.connections
    },
} as Set<BunWebSocket>

// For backward compatibility, re-export broadcast from the manager
export const broadcast = (url: string, data: MessageData, method = 'POST') => {
    serverManager?.broadcast(url, data, method)
}
