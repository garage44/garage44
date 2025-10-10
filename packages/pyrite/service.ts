#!/usr/bin/env bun
import {URL, fileURLToPath} from 'node:url'
import {WebSocketServerManager, createBunWebSocketHandler} from '@garage44/common/lib/ws-server'
import {bunchyArgs, bunchyService} from '@garage44/bunchy'
import {config, initConfig} from './lib/config.ts'
import {devContext} from '@garage44/common/lib/dev-context'
import figlet from 'figlet'
import fs from 'fs-extra'
import {hideBin} from 'yargs/helpers'
import {initMiddleware} from './lib/middleware.ts'
import {loggerTransports} from '@garage44/common/lib/service.ts'
import path from 'node:path'
import pc from 'picocolors'
import {registerChatWebSocket} from './api/ws-chat.ts'
import {registerGroupsWebSocket} from './api/ws-groups.ts'
import {registerPresenceWebSocket} from './api/ws-presence.ts'
import yargs from 'yargs'

const pyriteDir = fileURLToPath(new URL('.', import.meta.url))

const runtime = {
    service_dir: pyriteDir,
    version: JSON.parse((await fs.readFile(path.join(pyriteDir, 'package.json'), 'utf8'))).version,
}

function welcomeBanner() {
    return `
${pc.cyan(figlet.textSync("Pyrite"))}\n
 ${pc.white(pc.bold('Video conferencing powered by Galène...'))}
 ${pc.gray(`v${runtime.version}`)}
`
}

// In case we start in development mode.
let bunchyConfig = null

const logger = loggerTransports(config.logger, 'service')

const BUN_ENV = process.env.BUN_ENV || 'production'

const cli = yargs(hideBin(process.argv))
cli.scriptName("pyrite")

if (BUN_ENV === 'development') {
    bunchyConfig = {
        common: path.resolve(runtime.service_dir, '../', 'common'),
        logPrefix: 'P',
        reload_ignore: [],
        version: runtime.version,
        workspace: runtime.service_dir,
    }

    bunchyArgs(cli, bunchyConfig)
}

cli.usage('Usage: $0 [task]')
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

        // Initialize middleware and WebSocket server
        const {handleRequest} = await initMiddleware(bunchyConfig)

        // Create WebSocket managers
        const wsManager = new WebSocketServerManager({
            authOptions: config.authOptions,
            endpoint: '/ws',
            sessionMiddleware: config.sessionMiddleware,
        })

        const bunchyManager = new WebSocketServerManager({
            authOptions: config.authOptions,
            endpoint: '/bunchy',
            sessionMiddleware: config.sessionMiddleware,
        })

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

        // Start Bun.serve server
        const server = Bun.serve({
            fetch: (req, server) => {
                const url = new URL(req.url)
                if (url.pathname === '/dev/snapshot') {
                    return new Response(JSON.stringify(devContext.snapshot({
                        version: runtime.version,
                        workspace: 'pyrite',
                    })), { headers: { 'Content-Type': 'application/json' } })
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
