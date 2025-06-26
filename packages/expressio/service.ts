#!/usr/bin/env bun
import {URL, fileURLToPath} from 'node:url'
import {bunchyArgs, bunchyService} from '@garage44/bunchy'
import {config, initConfig} from './lib/config.ts'
import {keyMod, padLeft} from '@garage44/common/lib/utils.ts'
import {serviceLogger, loggerTransports} from '@garage44/common/lib/service.ts'
import {Enola} from '@garage44/enola'
import {Workspace} from './lib/workspace.ts'
import {Workspaces} from './lib/workspaces.ts'
import figlet from 'figlet'
import fs from 'fs-extra'
import {hideBin} from 'yargs/helpers'
import {i18nFormat} from '@garage44/common/lib//i18n.ts'
import {initMiddleware} from './lib/middleware.ts'
import {initDualWebSocketServer} from './lib/ws-server.ts'
import {lintWorkspace} from './lib/lint.ts'
import path from 'node:path'
import {pathCreate} from '@garage44/common/lib/paths'
import pc from 'picocolors'

import yargs from 'yargs'
import {registerI18nWebSocketApiRoutes} from './api/i18n.ts'
import {registerWorkspacesWebSocketApiRoutes} from './api/workspaces.ts'

const expressioDir = fileURLToPath(new URL('.', import.meta.url))

export const runtime = {
    service_dir: expressioDir,
    version: JSON.parse((await fs.readFile(path.join(expressioDir, 'package.json'), 'utf8'))).version,
}

function welcomeBanner() {
    return `
${pc.blue(figlet.textSync("Expressio"))}\n
 ${pc.white(pc.bold('AI-automated I18n'))}
 ${pc.gray(`v${runtime.version}`)}
`
}

// In case we start in development mode.
let bunchyConfig

export let logger = loggerTransports(config.logger, 'service')
export const enola = new Enola()
export const workspaces = new Workspaces()

const BUN_ENV = process.env.BUN_ENV || 'production'

const cli = yargs(hideBin(process.argv))
cli.scriptName("expressio")

if (BUN_ENV === 'development') {
    bunchyConfig = {
        common: path.resolve(runtime.service_dir, '../', 'common'),
        // reload_ignore: ['/tasks/code_frontend'],
        reload_ignore: [],
        version: runtime.version,
        workspace: runtime.service_dir,
    }

    bunchyArgs(cli, bunchyConfig)
}

cli.usage('Usage: $0 [task]')
    .detectLocale(false)
    .command('import', 'Import source translations from i18next file', (yargs) => {
        return yargs
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
    }, async(argv) => {
        logger = loggerTransports(config.logger, 'cli')
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
    .command('export', 'Export target translations to i18next format', (yargs) => {
        logger = loggerTransports(config.logger, 'cli')
        return yargs
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
    }, async(argv) => {
        logger = loggerTransports(config.logger, 'cli')
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
    .command('lint', 'Lint translations', async(yargs) => {
        logger = loggerTransports(config.logger, 'cli')
        return yargs.option('workspace', {
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
                    // eslint-disable-next-line no-console
                    console.log(pc.underline(`\n${fileGroup.file}`))
                    for (const tag of fileGroup.groups) {
                        // eslint-disable-next-line no-console
                        console.log(
                            `${padLeft(`${tag.line}:${tag.column}`, maxPadding, ' ')} ${pc.red('error')} ${tag.match[0]} found in source code, but not in workspace`,
                        )
                    }
                }
            }

            if (lintResult.delete_tags.length) {
                for (const {group, tags} of lintResult.delete_tags) {
                    // eslint-disable-next-line no-console
                    console.log(pc.underline(`\n${group}`))
                    for (const tag of tags) {
                        // eslint-disable-next-line no-console
                        console.log(`  ${pc.red('error')} ${tag.path.join('.')} in workspace, but not found in source code`)
                    }
                }
            }

            const problems = lintResult.create_tags.length + lintResult.delete_tags.length
            // eslint-disable-next-line no-console
            console.log(`\n✖ Found ${problems} issues`)
            process.exit(1)
        }

        // eslint-disable-next-line no-console
        console.log(`\n✔ No issues found`)
        process.exit(0)

    })
    .command('start', 'Start the Expressio service', (yargs) => {
        // eslint-disable-next-line no-console
        console.log(welcomeBanner())

        logger = loggerTransports(config.logger, 'service')
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
        await Promise.all([
            enola.init(config.enola, logger),
            workspaces.init(config.workspaces),
        ])

        // Initialize middleware and WebSocket server
        const { handleRequest, handleWebSocket } = await initMiddleware(bunchyConfig)
        const enhancedWebSocketHandler = initDualWebSocketServer(handleWebSocket, config)
        registerI18nWebSocketApiRoutes()
        registerWorkspacesWebSocketApiRoutes()

        // Start Bun.serve server
        const server = Bun.serve({
            port: argv.port,
            hostname: argv.host,
            fetch: (req, server) => handleRequest(req, server),
            websocket: enhancedWebSocketHandler,
        })

        if (BUN_ENV === 'development') {
            await bunchyService(server, bunchyConfig)
        }

        logger.info(`service: http://${argv.host}:${argv.port}`)
    })
    .demandCommand()
    .help('help')
    .showHelpOnFail(true)
    .argv
