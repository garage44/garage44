import {
    MessageData,
} from '@garage44/common/lib/ws-server'
import {Scss, generateRandomId, showConfig} from './utils'
import {URL, fileURLToPath} from 'node:url'
import path from 'node:path'
import {tasks} from './tasks.ts'
import { logger } from '@garage44/common/lib/logger'

// Import the real broadcast function - will be set during bunchyService initialization
let broadcastFn: ((url: string, data: MessageData, method?: string) => void) | null = null

const currentDir = fileURLToPath(new URL('.', import.meta.url))

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

    // Import the real broadcast function from the WebSocket server
    try {
        const { broadcast: realBroadcast } = await import('@garage44/expressio/lib/ws-server')
        broadcastFn = realBroadcast
        logger.info('[bunchy] Connected to WebSocket broadcast system')
    } catch (error) {
        logger.error('[bunchy] Failed to connect to WebSocket broadcast system:', error)
    }

    // For Bun.serve, we don't need to create a separate WebSocket server
    // The WebSocket functionality is handled by the main server's websocket option
    // Just log that bunchy is ready
    logger.info('[bunchy] Development service ready')

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
    add: (ws) => logger.info('[bunchy] WebSocket connection added'),
    delete: (ws) => logger.info('[bunchy] WebSocket connection removed'),
    has: (ws) => false,
    get size() { return 0 },
    [Symbol.iterator]: function*() {
        // No connections in Bun.serve mode
    },
} as Set<WebSocket>

// For backward compatibility, re-export broadcast from the manager
export const broadcast = (url: string, data: MessageData, method = 'POST') => {
    if (broadcastFn) {
        broadcastFn(url, data, method)
        logger.debug('[bunchy] Broadcast sent:', url, data, method)
    } else {
        logger.warn('[bunchy] Broadcast attempted but WebSocket not connected:', url, data, method)
    }
}
