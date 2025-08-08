#!/usr/bin/env bun
import {URL, fileURLToPath} from 'node:url'
import {WebSocketServerManager, createBunWebSocketHandler} from '@garage44/common/lib/ws-server'
import {bunchyArgs, bunchyService} from '@garage44/bunchy'
import {config, initConfig} from './lib/config.ts'
import {keyMod, padLeft} from '@garage44/common/lib/utils.ts'
import {Enola} from '@garage44/enola'
import {Workspace} from './lib/workspace.ts'
import {Workspaces} from './lib/workspaces.ts'
import figlet from 'figlet'
import fs from 'fs-extra'
import {hideBin} from 'yargs/helpers'
import {i18nFormat} from '@garage44/common/lib//i18n.ts'
import {initMiddleware} from './lib/middleware.ts'
import {lintWorkspace} from './lib/lint.ts'
import {loggerTransports} from '@garage44/common/lib/service.ts'
import path from 'node:path'
import {pathCreate} from '@garage44/common/lib/paths'
import pc from 'picocolors'
import {registerI18nWebSocketApiRoutes} from './api/i18n.ts'
import {registerWorkspacesWebSocketApiRoutes} from './api/workspaces.ts'
import yargs from 'yargs'
import {devContext} from '@garage44/common/lib/dev-context'

const expressioDir = fileURLToPath(new URL('.', import.meta.url))

const runtime = {
    service_dir: expressioDir,
    version: JSON.parse((await fs.readFile(path.join(expressioDir, 'package.json'), 'utf8'))).version,
}

function welcomeBanner() {
    return `
${pc.blue(figlet.textSync("Expressio"))}\n
 ${pc.white(pc.bold('I18n for humans, through AI...'))}
 ${pc.gray(`v${runtime.version}`)}
`
}

// In case we start in development mode.
let bunchyConfig = null

const logger = loggerTransports(config.logger, 'service')
const enola = new Enola()
const workspaces = new Workspaces()

const BUN_ENV = process.env.BUN_ENV || 'production'

const cli = yargs(hideBin(process.argv))
cli.scriptName("expressio")

if (BUN_ENV === 'development') {
    bunchyConfig = {
        common: path.resolve(runtime.service_dir, '../', 'common'),
        logPrefix: 'B',
        // reload_ignore: ['/tasks/code_frontend'],
        reload_ignore: [],
        version: runtime.version,
        workspace: runtime.service_dir,
    }

    bunchyArgs(cli, bunchyConfig)
}

cli.usage('Usage: $0 [task]')
    .detectLocale(false)
    .command('import', 'Import source translations from i18next file', (yargs) =>
        yargs
            .option('workspace', {
                alias: 'w',
                default: './src/.expressio.json',
                describe: 'Workspace file to use',
                type: 'string',
            })
            .option('input', {
                alias: 'i',
                default: 'en.json',
                describe: 'I18next file for input',
                type: 'string',
            })
    , async(argv) => {
        const workspace = new Workspace()
        await workspace.init({
            source_file: path.resolve(argv.workspace),
        }, false)

        const importData = JSON.parse((await fs.readFile(argv.file, 'utf8')))
        const createTags = []

        keyMod(importData, (sourceRef, id, refPath) => {
            // The last string in refPath must not be a reserved keyword (.e.g source/target)
            const last = refPath[refPath.length - 1]
            if (last === 'source' || last === 'target') {
                logger.warn(`skipping reserved keyword: ${last} (refPath: ${refPath.join('.')})`)
                return
            }

            if (typeof sourceRef[id] === 'string') {
                createTags.push(refPath)
                pathCreate(workspace.i18n, [...refPath], {
                    source: sourceRef[id],
                }, [])
            }
        })

        await workspace.save()
        logger.info(`Imported: ${createTags.length} tags`)
    })
    .command('export', 'Export target translations to i18next format', (yargs) =>
        yargs
            .option('workspace', {
                alias: 'w',
                default: './src/.expressio.json',
                describe: 'Workspace file to use',
                type: 'string',
            })
            .option('output', {
                alias: 'o',
                default: './i18next.json',
                describe: 'I18next file for output',
                type: 'string',
            })
    , async(argv) => {
        const workspace = new Workspace()
        await workspace.init({
            source_file: path.resolve(argv.workspace),
        }, false)

        const bundleTarget = path.resolve(path.dirname(workspace.config.source_file), argv.output)
        logger.info(`Exported to: ${bundleTarget}`)
        await fs.mkdirp(path.dirname(bundleTarget))
        fs.writeFile(bundleTarget, JSON.stringify(i18nFormat(
            workspace.i18n,
            workspace.config.languages.target,
        )))
    })
    .command('lint', 'Lint translations', (yargs) => {
        yargs.option('workspace', {
            alias: 'w',
            default: './src/.expressio.json',
            describe: 'Workspace file to use',
            type: 'string',
        })
    }, async(argv) => {
        const workspace = new Workspace()
        await workspace.init({
            source_file: path.resolve(argv.workspace),
        }, false)

        const lintResult = await lintWorkspace(workspace, 'lint')

        if (lintResult) {
            const maxPadding = Math.max(...lintResult.create_tags.map((fileGroup) =>
                Math.max(...fileGroup.groups.map((tag) => `${tag.line}:${tag.column}`.length)),
            )) + 2

            for (const fileGroup of lintResult.create_tags) {
                if (fileGroup.groups.length) {
                    // oxlint-disable-next-line no-console
                    console.log(pc.underline(`\n${fileGroup.file}`))
                    for (const tag of fileGroup.groups) {
                        // oxlint-disable-next-line no-console
                        console.log(
                            `${padLeft(`${tag.line}:${tag.column}`, maxPadding, ' ')} ${pc.red('error')} ${tag.match[0]} found in source code, but not in workspace`,
                        )
                    }
                }
            }

            if (lintResult.delete_tags.length) {
                for (const {group, tags} of lintResult.delete_tags) {
                    // oxlint-disable-next-line no-console
                    console.log(pc.underline(`\n${group}`))
                    for (const tag of tags) {
                        // oxlint-disable-next-line no-console
                        console.log(`  ${pc.red('error')} ${tag.path.join('.')} in workspace, but not found in source code`)
                    }
                }
            }

            const problems = lintResult.create_tags.length + lintResult.delete_tags.length
            // oxlint-disable-next-line no-console
            console.log(`\n✖ Found ${problems} issues`)
            process.exit(1)
        }

        // oxlint-disable-next-line no-console
        console.log(`\n✔ No issues found`)
        process.exit(0)
    })
    .command('start', 'Start the Expressio service', (yargs) => {
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
                describe: 'port to run the Expression service on',
                type: 'number',
            })
    }, async(argv) => {
        await initConfig(config)
        // Initialize enola first
        await enola.init(config.enola, logger)

        // Initialize middleware and WebSocket server
        const {handleRequest} = await initMiddleware(bunchyConfig)

        // Create WebSocket managers directly
        const wsManager = new WebSocketServerManager({
            authOptions: config.authOptions,
            endpoint: '/ws',
            sessionMiddleware: config.sessionMiddleware,
        })

        // Set the WebSocket manager for workspaces and then initialize
        workspaces.setWebSocketManager(wsManager)
        await workspaces.init(config.workspaces)

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
        registerI18nWebSocketApiRoutes(wsManager)
        registerWorkspacesWebSocketApiRoutes(wsManager)

        // Start Bun.serve server
        const server = Bun.serve({
            fetch: (req, server) => {
                const url = new URL(req.url)
                if (url.pathname === '/dev/snapshot') {
                    return new Response(JSON.stringify(devContext.snapshot({
                        version: runtime.version,
                        workspace: 'expressio',
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
    enola,
    logger,
    runtime,
    workspaces,
}