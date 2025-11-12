#!/usr/bin/env bun
import {WebSocketServerManager, createBunWebSocketHandler} from '@garage44/common/lib/ws-server'
import {bunchyArgs, bunchyService} from '@garage44/bunchy'
import {hideBin} from 'yargs/helpers'
import path from 'path'
import {withSpaFallback, setupBunchyConfig} from '@garage44/common/service'
import {devContext} from '@garage44/common/lib/dev-context'
import {findWorkspaceRoot, readReadme} from './lib/workspace'
import {existsSync, readFileSync} from 'fs'
import {handleWebhook, handlePRWebhook} from './lib/webhook'
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
cli.scriptName('malkovich')

if (BUN_ENV === 'development') {
    bunchyArgs(cli, bunchyConfig)
}

const _ = cli.usage('Usage: $0 [task]')
    .command('start', 'Start the malkovich development server', (yargs) =>
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

        // Find workspace root for reading markdown files
        const workspaceRoot = findWorkspaceRoot() || import.meta.dir

        // Simple file handler for static files
        const handleRequest = async (req: Request, server?: any) => {
            const url = new URL(req.url)
            let pathname = url.pathname

            // Dev snapshot endpoint provided by Bunchy context
            if (pathname === '/dev/snapshot') {
                return new Response(JSON.stringify(devContext.snapshot({
                    version: bunchyConfig?.version,
                    workspace: 'malkovich',
                })), {headers: {'Content-Type': 'application/json'}})
            }

            // Webhook endpoint: /webhook (main branch deployments)
            if (pathname === '/webhook') {
                return await handleWebhook(req)
            }

            // PR webhook endpoint: /webhook/pr (PR-triggered deployments)
            if (pathname === '/webhook/pr') {
                return await handlePRWebhook(req)
            }

            // API endpoint: /api/markdown?path=README.md
            if (pathname === '/api/markdown') {
                const params = new URLSearchParams(url.search)
                let filePath = params.get('path')

                if (!filePath) {
                    return new Response(JSON.stringify({error: 'Missing path parameter'}), {
                        headers: {'Content-Type': 'application/json'},
                        status: 400,
                    })
                }

                // All paths are relative to workspace root
                // Remove leading slash if present
                if (filePath.startsWith('/')) {
                    filePath = filePath.slice(1)
                }
                let fullPath = path.join(workspaceRoot, filePath)

                // Handle directory paths (check for README.md)
                if (!filePath.endsWith('.md') && !filePath.endsWith('.mdc')) {
                    const dirPath = existsSync(fullPath) && !fullPath.endsWith('.md') && !fullPath.endsWith('.mdc')
                        ? path.join(fullPath, 'README.md')
                        : fullPath

                    if (existsSync(dirPath)) {
                        fullPath = dirPath
                    }
                }

                if (existsSync(fullPath)) {
                    try {
                        const content = readFileSync(fullPath, 'utf-8')
                        return new Response(JSON.stringify({content}), {
                            headers: {'Content-Type': 'application/json'},
                        })
                    } catch (error) {
                        return new Response(JSON.stringify({error: 'Failed to read file'}), {
                            headers: {'Content-Type': 'application/json'},
                            status: 500,
                        })
                    }
                }

                return new Response(JSON.stringify({error: 'File not found'}), {
                    headers: {'Content-Type': 'application/json'},
                    status: 404,
                })
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

        console.log(`Malkovich server: http://${argv.host}:${argv.port}`)
    })
    .command('publish', 'Publish all workspace packages to npm', async () => {
        const {publish} = await import('./lib/publish')
        await publish()
    })
    .command('generate-systemd', 'Generate systemd service files', (yargs) =>
        yargs
            .option('domain', {
                demandOption: true,
                describe: 'Domain name (e.g., garage44.org)',
                type: 'string',
            })
    , async (argv) => {
        const {generateSystemd} = await import('./lib/deploy/systemd')
        const output = generateSystemd(argv.domain)
        console.log(output)
    })
    .command('generate-nginx', 'Generate nginx configuration', (yargs) =>
        yargs
            .option('domain', {
                demandOption: true,
                describe: 'Domain name (e.g., garage44.org)',
                type: 'string',
            })
    , async (argv) => {
        const {generateNginx} = await import('./lib/deploy/nginx')
        const output = generateNginx(argv.domain)
        console.log(output)
    })
    .command('init', 'Initialize AGENTS.md file', async () => {
        const {init} = await import('./lib/init')
        await init()
    })
    .demandCommand()
    .help('help')
    .showHelpOnFail(true)
    .argv