import {copyObject, randomId} from '@garage44/common/lib/utils.ts'
import {logger} from '../service.ts'
import fs from 'fs-extra'
import {homedir} from 'node:os'
import path from 'node:path'
import rc from 'rc'

const config = rc('pyrite', {
    listen: {
        host: '0.0.0.0',
        port: 3030,
    },
    logger: {
        file: 'pyrite.log',
        level: 'debug',
    },
    session: {
        cookie: {maxAge: 1000 * 60 * 60 * 24}, // One day
        resave: false,
        saveUninitialized: true,
        secret: randomId(32),
    },
    sfu: {
        path: null,
        url: 'http://localhost:8443',
    },
    users: [
        {
            admin: true,
            name: 'admin',
            password: 'admin',
        },
    ],
})

async function initConfig(config) {
    const configPath = path.join(homedir(), '.pyriterc')
    // Check if the config file exists
    if (!await fs.pathExists(configPath)) {
        await saveConfig()
    }
    return config
}

async function saveConfig() {
    const configPath = path.join(homedir(), '.pyriterc')
    const data = copyObject(config)
    delete data.configs
    delete data.config
    delete data._

    await fs.writeFile(configPath, JSON.stringify(data, null, 4))
    logger.info(`[config] saved config to ${configPath}`)
}

export {
    config,
    initConfig,
    saveConfig,
}
