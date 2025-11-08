#!/usr/bin/env bun
import {WebSocketServerManager, createBunWebSocketHandler} from '@garage44/common/lib/ws-server'
import {bunchyArgs, bunchyService} from '@garage44/bunchy'
import {hideBin} from 'yargs/helpers'
import path from 'path'
import {withSpaFallback, setupBunchyConfig} from '@garage44/common/service'
import {devContext} from '@garage44/common/lib/dev-context'
import yargs from 'yargs'

const BUN_ENV = process.env.BUN_ENV || 'production'

let bunchyConfig: any = null

if (BUN_ENV === 'development') {
    bunchyConfig = setupBunchyConfig({
        logPrefix: 'B',
        serviceDir: import.meta.dir,
        version: '1.0.0',
    })
}

const cli = yargs(hideBin(process.argv))
cli.scriptName('styleguide')

if (BUN_ENV === 'development') {
    bunchyArgs(cli, bunchyConfig)
}

cli.usage('Usage: $0 [task]')
    .command('start', 'Start the styleguide development server', (yargs) =>
        yargs
            .option('host', {
                default: 'localhost',
                describe: 'Host to bind the server to',
                type: 'string',
            })
            .option('port', {
                default: 3032,
                describe: 'Port to bind the server to',
                type: 'number',
            })
    , async(argv) => {
        // Create WebSocket manager for Bunchy live reloading
        const bunchyManager = new WebSocketServerManager({
            endpoint: '/bunchy',
        })

        // Map of endpoint to manager for the handler
        const wsManagers = new Map([
            ['/bunchy', bunchyManager],
        ])

        const enhancedWebSocketHandler = createBunWebSocketHandler(wsManagers)

        // Simple file handler for static files
        const handleRequest = async (req: Request, server?: any) => {
            const url = new URL(req.url)
            let pathname = url.pathname

            // Dev snapshot endpoint provided by Bunchy context
            if (pathname === '/dev/snapshot') {
                return new Response(JSON.stringify(devContext.snapshot({
                    version: bunchyConfig?.version,
                    workspace: 'styleguide',
                })), {headers: {'Content-Type': 'application/json'}})
            }

            // Handle WebSocket upgrade requests
            if (url.pathname === '/bunchy') {
                if (server && typeof server.upgrade === 'function') {
                    const success = server.upgrade(req, {data: {endpoint: url.pathname}})
                    if (success) {
                        return
                    }
                    return new Response('WebSocket upgrade failed', {status: 400})
                }
                return new Response('WebSocket server not available', {status: 500})
            }

            // Default to index.html for root
            if (pathname === '/') {
                pathname = '/index.html'
            }

            // Handle /public/ prefixed URLs by stripping the prefix
            if (pathname.startsWith('/public/')) {
                const filePath = path.join(import.meta.dir, 'public', pathname.replace('/public', ''))
                const file = Bun.file(filePath)
                if (await file.exists()) {
                    return new Response(file)
                }
            }

            // Try to serve from public directory first (built files)
            const publicPath = path.join(import.meta.dir, 'public', pathname)
            const publicFile = Bun.file(publicPath)

            if (await publicFile.exists()) {
                return new Response(publicFile)
            }

            // Fallback to src directory for development
            const srcPath = path.join(import.meta.dir, 'src', pathname)
            const srcFile = Bun.file(srcPath)

            if (await srcFile.exists()) {
                return new Response(srcFile)
            }

            // Create 404 response and apply SPA fallback
            const notFoundResponse = new Response('Not Found', {status: 404})
            return await withSpaFallback(notFoundResponse, req, import.meta.dir)
        }

        // Start Bun.serve server
        const server = Bun.serve({
            fetch: (req, server) => handleRequest(req, server),
            hostname: argv.host,
            port: argv.port,
            websocket: enhancedWebSocketHandler,
        })

        if (BUN_ENV === 'development') {
            await bunchyService(server, bunchyConfig, bunchyManager)
        }

        console.log(`Styleguide server: http://${argv.host}:${argv.port}`)
    })
    .demandCommand()
    .help('help')
    .showHelpOnFail(true)
    .argv