import app from '../app.js'
import crypto from 'crypto'
import {dirname} from 'path'
import fetch from 'node-fetch'
import {fileURLToPath} from 'url'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import os from 'os'
import path from 'path'
import {userTemplate} from './user.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function verifyConfig(app) {
    const pkg = JSON.parse(await fs.readFile(path.join(__dirname, '..', '..', 'package.json'), 'utf-8'))
    app.logger.info(`starting pyrite v${pkg.version}`)
    let configFile
    if (app.settings.config) {
        configFile = path.join(app.settings.config)
    } else {
        configFile = path.join(process.env.HOME, '.pyriterc')
    }
    // Always keep a reference to the config file itself in the config.
    app.settings.config = configFile

    if (!await fs.pathExists(configFile)) {
        app.logger.info('generating config...')
        let sfuPath

        // sfuPath & sfuUrl are passed as commandline argument
        if (app.settings.sfuPath) {
            sfuPath = app.settings.sfuPath
            delete app.settings.sfuPath
        } else {
            const config = await inquirer.prompt([
                {
                    message: 'Path to Galène SFU:',
                    name: 'sfuPath',
                    type: 'input',
                },
            ])
            const sfuPathParts = config.sfuPath.split(path.sep)
            if (sfuPathParts[0] === '~') {
                sfuPathParts[0] = os.homedir()
            }

            sfuPath = sfuPathParts.join(path.sep)
        }

        // Add initial user.
        const user = userTemplate({admin: true, name: 'pyrite'})
        app.logger.info(`initial admin login: ${user.name}/${user.password}`)
        app.settings.users = [user]

        if (app.settings.sfuUrl) {
            app.settings.sfu.url = app.settings.sfuUrl
            delete app.settings.sfuUrl
        }

        app.settings.sfu.path = sfuPath
        app.settings.session.secret = crypto.randomBytes(20).toString('hex')

        await fs.writeFile(configFile, JSON.stringify(app.settings, null, '  '))
        app.logger.info(`config file written to: ${configFile}`)
    }

    app.config.sfu = {
        path: {
            data: path.join(app.settings.sfu.path, 'data'),
            groups: path.join(app.settings.sfu.path, 'groups'),
            recordings: path.join(app.settings.sfu.path, 'recordings'),
        },
    }
}

export async function verifySFU() {
    if (!await fs.pathExists(app.config.sfu.path.data)) {
        app.logger.info(`creating sfu path: ${app.config.sfu.path.data}`)
        await fs.mkdir(app.config.sfu.path.data)
    }

    if (!await fs.pathExists(app.config.sfu.path.groups)) {
        app.logger.info(`creating sfu path: ${app.config.sfu.path.groups}`)
        await fs.mkdir(app.config.sfu.path.groups)
    }

    if (!await fs.pathExists(app.config.sfu.path.recordings)) {
        app.logger.info(`creating sfu path: ${app.config.sfu.path.recordings}`)
        await fs.mkdir(app.config.sfu.path.recordings)
    }

    const sfuConfigFile = path.join(app.config.sfu.path.data, 'config.json')
    if (!await fs.pathExists(sfuConfigFile)) {
        app.logger.info(`creating sfu config: ${sfuConfigFile}`)
        await fs.writeFile(sfuConfigFile, JSON.stringify({
            admin: [{
                password: crypto.randomBytes(20).toString('hex'),
                username: 'admin',
            }],
        }, null, '  '))
    }

    const config = JSON.parse(await fs.readFile(sfuConfigFile, 'utf-8'))
    app.config.sfu.admin = {
        password: config.admin[0].password,
        username: config.admin[0].username,
    }

    // Test sfu endpoint
    const authHeader = `Basic ${Buffer.from(`${app.config.sfu.admin.username}:${app.config.sfu.admin.password}`, 'utf-8').toString('base64')}`
    const headers = new fetch.Headers()
    headers.append('Authorization', authHeader)

    try {
        const res = await fetch(`${app.settings.sfu.url}/stats.json`, {headers})
        if (res.status === 401) {
            app.logger.error('sfu endpoint unauthorized; check sfu config')
        }
    } catch(err) {
        app.logger.error(`sfu not detected (${app.settings.sfu.url})`)
    }
}
