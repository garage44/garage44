#!/usr/bin/env bun
import {WebSocketServerManager, createBunWebSocketHandler} from '@garage44/common/lib/ws-server'
import {bunchyArgs, bunchyService, wrapFetchHandler} from '@garage44/bunchy'
import {hideBin} from 'yargs/helpers'
import path from 'path'
import {withSpaFallback, setupBunchyConfig} from '@garage44/common/service'
import {devContext} from '@garage44/common/lib/dev-context'
import {findWorkspaceRoot, readReadme} from './lib/workspace'
import {existsSync, readFileSync} from 'fs'
import {handleWebhook} from './lib/webhook'
import {$} from 'bun'
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

            // Webhook endpoint: /webhook
            if (pathname === '/webhook') {
                return await handleWebhook(req)
            }

            // API endpoint: /api/docs - Documentation structure discovery
            if (pathname === '/api/docs') {
                try {
                    const {discoverAllPackages} = await import('./lib/docs')
                    const structure = await discoverAllPackages(workspaceRoot)
                    return new Response(JSON.stringify(structure), {
                        headers: {'Content-Type': 'application/json'},
                    })
                } catch (error) {
                    console.error('[api/docs] Error:', error)
                    return new Response(JSON.stringify({error: 'Failed to discover documentation'}), {
                        headers: {'Content-Type': 'application/json'},
                        status: 500,
                    })
                }
            }

            // API endpoint: /api/docs/package/:packageName - Package-specific docs
            if (pathname.startsWith('/api/docs/package/')) {
                try {
                    const packageName = pathname.replace('/api/docs/package/', '')
                    const {discoverPackageDocs} = await import('./lib/docs')
                    const {index, docs} = await discoverPackageDocs(workspaceRoot, packageName)
                    return new Response(JSON.stringify({name: packageName, index, docs}), {
                        headers: {'Content-Type': 'application/json'},
                    })
                } catch (error) {
                    console.error('[api/docs/package] Error:', error)
                    return new Response(JSON.stringify({error: 'Failed to discover package documentation'}), {
                        headers: {'Content-Type': 'application/json'},
                        status: 500,
                    })
                }
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
        // Wrap fetch handler to automatically handle Bunchy WebSocket upgrades
        const server = Bun.serve({
            fetch: wrapFetchHandler((req, server) => handleRequest(req, server)),
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
    .command('rules', 'Create symlink from .cursor/rules to malkovich/docs/rules', async () => {
        const {rules} = await import('./lib/rules')
        await rules()
    })
    .command('deploy-pr', 'Deploy a PR branch manually (for Cursor agent)', (yargs) =>
        yargs
            .option('number', {
                demandOption: true,
                describe: 'PR number to deploy',
                type: 'number',
            })
            .option('branch', {
                demandOption: true,
                describe: 'Branch name (e.g., feature/new-ui)',
                type: 'string',
            })
            .option('sha', {
                describe: 'Commit SHA (defaults to latest)',
                type: 'string',
            })
            .option('author', {
                default: 'local',
                describe: 'Author name',
                type: 'string',
            })
    , async (argv) => {
        const {deployPR} = await import('./lib/pr-deploy')

        // Get latest SHA if not provided
        let sha = argv.sha
        if (!sha) {
            const result = await $`git rev-parse origin/${argv.branch}`.quiet()
            sha = result.stdout.toString().trim()
        }

        const pr = {
            author: argv.author,
            head_ref: argv.branch,
            head_sha: sha,
            is_fork: false,  // Local PRs are trusted
            number: argv.number,
            repo_full_name: 'garage44/garage44',
        }

        const result = await deployPR(pr)

        if (result.success && result.deployment) {
            console.log('\n✅ PR Deployment Successful!\n')

            // Discover which packages were deployed
            const {extractWorkspacePackages, isApplicationPackage} = await import('./lib/workspace')
            const repoDir = `${result.deployment.directory}/repo`
            const {existsSync} = await import('fs')
            let packagesToShow: string[] = []

            if (existsSync(repoDir)) {
                const allPackages = extractWorkspacePackages(repoDir)
                const appPackages = allPackages.filter((pkg) => isApplicationPackage(pkg))
                packagesToShow = [...appPackages, 'malkovich'] // Always include malkovich
            } else {
                // Fallback: use known packages if repo directory doesn't exist
                packagesToShow = ['expressio', 'pyrite', 'malkovich']
            }

            // Show URLs for each package
            console.log(`URLs:`)
            for (const packageName of packagesToShow) {
                const port = result.deployment.ports[packageName as keyof typeof result.deployment.ports] || result.deployment.ports.malkovich
                console.log(`  ${packageName}: https://pr-${argv.number}-${packageName}.garage44.org (port ${port})`)
            }

            console.log(`\nNote: Deployment is publicly accessible (no token required)`)
        } else {
            console.error(`\n❌ Deployment failed: ${result.message}`)
            process.exit(1)
        }
    })
    .command('list-pr-deployments', 'List all active PR deployments', async () => {
        const {listPRDeployments} = await import('./lib/pr-cleanup')
        await listPRDeployments()
    })
    .command('cleanup-pr', 'Cleanup a specific PR deployment', (yargs) =>
        yargs.option('number', {
            demandOption: true,
            describe: 'PR number to cleanup',
            type: 'number',
        })
    , async (argv) => {
        const {cleanupPRDeployment} = await import('./lib/pr-cleanup')
        const result = await cleanupPRDeployment(argv.number)
        console.log(result.message)
        process.exit(result.success ? 0 : 1)
    })
    .command('cleanup-stale-prs', 'Cleanup stale PR deployments', (yargs) =>
        yargs.option('max-age-days', {
            default: 7,
            describe: 'Maximum age in days',
            type: 'number',
        })
    , async (argv) => {
        const {cleanupStaleDeployments} = await import('./lib/pr-cleanup')
        const result = await cleanupStaleDeployments(argv.maxAgeDays)
        console.log(result.message)
    })
    .command('regenerate-pr-nginx', 'Regenerate nginx configs for an existing PR deployment', (yargs) =>
        yargs.option('number', {
            demandOption: true,
            describe: 'PR number to regenerate nginx configs for',
            type: 'number',
        })
    , async (argv) => {
        const {regeneratePRNginx} = await import('./lib/pr-deploy')
        const result = await regeneratePRNginx(argv.number)
        console.log(result.message)
        process.exit(result.success ? 0 : 1)
    })
    .demandCommand()
    .help('help')
    .showHelpOnFail(true)
    .argv