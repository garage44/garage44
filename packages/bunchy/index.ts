import {URL, fileURLToPath} from 'node:url'
import {generateRandomId, showConfig} from './utils'
import {Logger} from '@garage44/common/lib/logger'
import type {MessageData} from '@garage44/common/lib/ws-server'
import path from 'node:path'
import {tasks} from './tasks.ts'

const logger = new Logger()

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

const settings = {} as Settings
const tooling = {} as {css: (options: {entrypoint: string, minify?: boolean, outFile: string, sourcemap?: boolean}) => Promise<string>}

function applySettings(config) {
    Object.assign(settings, {
        buildId: generateRandomId(),
        dir: {
            assets: path.resolve(path.join(config.workspace, 'src', 'assets')),
            bunchy: currentDir,
            common: config.common,
            components: path.resolve(path.join(config.workspace, 'src', 'components')),
            css: path.resolve(path.join(config.workspace, 'src', 'css')),
            public: path.resolve(path.join(config.workspace, `public`)),
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

async function bunchyService(server, config, wsManager?) {
    applySettings(config)

    // Set up broadcast function if WebSocket manager is provided
    if (wsManager) {
        broadcastFn = (url: string, data: MessageData, method = 'POST') => {
            wsManager.broadcast(url, data, method)
        }
        logger.info('[bunchy] connected to WebSocket broadcast system')

        // Set up log forwarding route
        setupLogForwarding(wsManager, config.logPrefix || 'B')
    } else {
        logger.warn('[bunchy] no WebSocket manager provided - broadcasts will be disabled')
    }

    logger.info('[bunchy] Development service ready')

    await tasks.dev.start({minify: false, sourcemap: true})
    return server
}

function bunchyArgs(yargs, config) {
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
    }).command('build', '[Bunchy] build application', (yargs) => {
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
const connections = {
    add: (ws) => logger.info('[bunchy] WebSocket connection added'),
    delete: (ws) => logger.info('[bunchy] WebSocket connection removed'),
    has: (ws) => false,
    get size() { return 0 },
} as Set<WebSocket>

// For backward compatibility, re-export broadcast from the manager
const broadcast = (url: string, data: MessageData, method = 'POST') => {
    if (broadcastFn) {
        broadcastFn(url, data, method)
        logger.debug('[bunchy] Broadcast sent:', url, data, method)
    } else {
        logger.warn('[bunchy] Broadcast attempted but WebSocket not connected:', url, data, method)
    }
}

// Set up log forwarding from client to server
function setupLogForwarding(wsManager: any, logPrefix: string) {
    logger.info(`[bunchy] Setting up log forwarding route with prefix: ${logPrefix}`)

    wsManager.api.post('/logs/forward', async (ctx, req) => {
        const { level, message, args, timestamp, source } = req.data as {
            level: string
            message: string
            args: string[]
            timestamp: string
            source: string
            prefix?: string
        }

        // Format the log message for server output
        const formattedMessage = `[${logPrefix}] ${message}`
        const formattedArgs = args && args.length > 0 ? args : []

        // Log using the server logger with appropriate level
        switch (level) {
            case 'error':
                logger.remote(formattedMessage, ...formattedArgs)
                break
            case 'warn':
                logger.remote(formattedMessage, ...formattedArgs)
                break
            case 'info':
                logger.remote(formattedMessage, ...formattedArgs)
                break
            case 'success':
                logger.remote(formattedMessage, ...formattedArgs)
                break
            case 'verbose':
                logger.remote(formattedMessage, ...formattedArgs)
                break
            case 'debug':
                logger.remote(formattedMessage, ...formattedArgs)
                break
            default:
                logger.remote(formattedMessage, ...formattedArgs)
        }

        return { status: 'ok' }
    })
}

export {
    bunchyArgs,
    bunchyService,
    broadcast,
    connections,
    logger,
    settings,
    tooling,
}