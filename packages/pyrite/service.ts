#!/usr/bin/env bun
import {URL, fileURLToPath} from 'node:url'
import {createBunWebSocketHandler} from '@garage44/common/lib/ws-server'
import {bunchyArgs, bunchyService} from '@garage44/bunchy'
import {config, initConfig} from './lib/config.ts'
import {devContext} from '@garage44/common/lib/dev-context'
import {createRuntime, createWelcomeBanner, setupBunchyConfig, createWebSocketManagers, service, loggerTransports} from '@garage44/common/service'
import {hideBin} from 'yargs/helpers'
import {initMiddleware} from './lib/middleware.ts'
import path from 'node:path'
import {registerChatWebSocket} from './api/ws-chat'
import {registerGroupsWebSocket} from './api/ws-groups'
import {registerPresenceWebSocket} from './api/ws-presence'
import {registerChannelsWebSocket} from './api/ws-channels'
import {initDatabase, initializeDefaultData} from './lib/database.ts'
import yargs from 'yargs'

const pyriteDir = fileURLToPath(new URL('.', import.meta.url))

const runtime = createRuntime(pyriteDir, path.join(pyriteDir, 'package.json'))

function welcomeBanner() {
    return createWelcomeBanner('Pyrite', 'Open communication platform for the modern workplace...', runtime.version)
}

// In case we start in development mode.
let bunchyConfig = null

const logger = loggerTransports(config.logger, 'service')

const BUN_ENV = process.env.BUN_ENV || 'production'

const cli = yargs(hideBin(process.argv))
cli.scriptName('pyrite')

if (BUN_ENV === 'development') {
    bunchyConfig = setupBunchyConfig(runtime.service_dir, 'P', runtime.version)

    bunchyArgs(cli, bunchyConfig)
}

void cli.usage('Usage: $0 [task]')
    .detectLocale(false)
    .command('start', 'Start the Pyrite service', (yargs) => {
        // oxlint-disable-next-line no-console
        console.log(welcomeBanner())
        return yargs
            .option('host', {
                alias: 'h',
                default: 'localhost',
                describe: 'hostname to listen on',
                type: 'string',
            })
            .option('port', {
                alias: 'p',
                default: 3030,
                describe: 'port to run the Pyrite service on',
                type: 'number',
            })
    }, async(argv) => {
        await initConfig(config)

        // Initialize database
        const database = initDatabase()

        // Initialize common service (including UserManager) with database
        // This creates the default admin user if it doesn't exist
        await service.init({appName: 'pyrite', configPath: '~/.pyriterc', useBcrypt: false}, database)

        // Initialize Pyrite-specific default data (channels, etc.)
        // Must run AFTER service.init() so that the admin user exists
        initializeDefaultData()

        // Initialize middleware and WebSocket server (after UserManager is initialized)
        const {handleRequest} = await initMiddleware(bunchyConfig)

        // Create WebSocket managers
        const {bunchyManager, wsManager} = createWebSocketManagers(config.authOptions, config.sessionMiddleware)

        // Map of endpoint to manager for the handler
        const wsManagers = new Map([
            ['/ws', wsManager],
            ['/bunchy', bunchyManager],
        ])

        const enhancedWebSocketHandler = createBunWebSocketHandler(wsManagers)

        // Register WebSocket API routes
        registerChatWebSocket(wsManager)
        registerGroupsWebSocket(wsManager)
        registerPresenceWebSocket(wsManager)
        registerChannelsWebSocket(wsManager)

        // Start Bun.serve server
        const server = Bun.serve({
            fetch: (req, server) => {
                const url = new URL(req.url)
                if (url.pathname === '/dev/snapshot') {
                    return new Response(JSON.stringify(devContext.snapshot({
                        version: runtime.version,
                        workspace: 'pyrite',
                    })), {headers: {'Content-Type': 'application/json'}})
                }
                return handleRequest(req, server)
            },
            hostname: argv.host,
            port: argv.port,
            websocket: enhancedWebSocketHandler,
        })

        if (BUN_ENV === 'development') {
            await bunchyService(server, bunchyConfig, bunchyManager)
        }

        logger.info(`service: http://${argv.host}:${argv.port}`)
    })
    .demandCommand()
    .help('help')
    .showHelpOnFail(true)
    .argv

export {
    logger,
    runtime,
}
