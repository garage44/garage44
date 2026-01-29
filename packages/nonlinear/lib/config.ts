import {copyObject, randomId} from '@garage44/common/lib/utils'
import {logger} from '../service.ts'
import fs from 'fs-extra'
import {homedir} from 'node:os'
import path from 'node:path'
import rc from 'rc'

const config = rc('nonlinear', {
    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: 'claude-3-5-sonnet-20241022',
    },
    git: {
        defaultPlatform: 'github',
        github: {
            token: process.env.GITHUB_TOKEN || '',
        },
        gitlab: {
            token: process.env.GITLAB_TOKEN || '',
            url: 'https://gitlab.com',
        },
    },
    agents: {
        prioritizer: {
            enabled: true,
            checkInterval: 300000, // 5 minutes
        },
        developer: {
            enabled: true,
            maxConcurrent: 3,
        },
        reviewer: {
            enabled: true,
            maxConcurrent: 2,
        },
    },
    ci: {
        maxFixAttempts: 3,
        timeout: 600000, // 10 minutes
    },
    logger: {
        file: 'nonlinear.log',
        level: 'debug',
    },
    session: {
        // One day
        cookie: {maxAge: 1000 * 60 * 60 * 24},
        resave: false,
        saveUninitialized: true,
        secret: randomId(32),
    },
    users: [
        {
            password: {
                key: 'admin',
                type: 'plaintext',
            },
            permissions: {
                admin: true,
            },
            profile: {
                displayName: 'Admin',
            },
            updatedAt: new Date().toISOString(),
            username: 'admin',
        },
    ],
})

async function initConfig(config) {
    // Check for environment variable first (for PR deployments and isolated instances)
    const envConfigPath = process.env.CONFIG_PATH
    const configPath = envConfigPath || path.join(homedir(), '.nonlinearrc')
    // Check if the config file exists
    if (!await fs.pathExists(configPath)) {
        await saveConfig()
    }
    return config
}

async function saveConfig() {
    // Check for environment variable first (for PR deployments and isolated instances)
    const envConfigPath = process.env.CONFIG_PATH
    const configPath = envConfigPath || path.join(homedir(), '.nonlinearrc')
    const data = copyObject(config)
    delete data.configs
    delete data.config
    delete data._

    await fs.writeFile(configPath, JSON.stringify(data, null, 4))
    logger.info(`[config] saved config to ${configPath}`)
}

export {
    config,
    saveConfig,
    initConfig,
}
