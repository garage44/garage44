import {
    MessageData,
} from '@garage44/common/lib/ws-server'
import {generateRandomId, showConfig} from './utils'
import {URL, fileURLToPath} from 'node:url'
import path from 'node:path'
import {tasks} from './tasks.ts'
import {Logger} from '@garage44/common/lib/logger'

export const logger = new Logger()

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
        css: string
        src: string
        workspace: string
    }
    reload_ignore: string[]
}

export const settings = {} as Settings
export const tooling = {} as {css: (options: {entrypoint: string, minify?: boolean, outFile: string, sourcemap?: boolean}) => Promise<string>}

async function applySettings(config) {
    Object.assign(settings, {
        buildId: generateRandomId(),
        dir: {
            assets: path.resolve(path.join(config.workspace, 'src', 'assets')),
            bunchy: currentDir,
            common: config.common,
            components: path.resolve(path.join(config.workspace, 'src', 'components')),
            public: path.resolve(path.join(config.workspace, `public`)),
            css: path.resolve(path.join(config.workspace, 'src', 'css')),
            src: path.resolve(path.join(config.workspace, 'src')),
            workspace: config.workspace,
        },
        minify: config.minify,
        reload_ignore: config.reload_ignore,
        sourcemap: config.sourcemap,
        version: config.version,
    })

    showConfig(settings)
}

export async function bunchyService(server, config, wsManager?) {
    applySettings(config)

    // Set up broadcast function if WebSocket manager is provided
    if (wsManager) {
        broadcastFn = (url: string, data: MessageData, method = 'POST') => {
            wsManager.broadcast(url, data, method)
        }
        logger.info('[bunchy] connected to WebSocket broadcast system')
    } else {
        logger.warn('[bunchy] no WebSocket manager provided - broadcasts will be disabled')
    }

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
