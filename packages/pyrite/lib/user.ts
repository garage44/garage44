import {config} from './config.ts'
import {logger} from '../service.ts'
import fs from 'fs-extra'
import {v4 as uuidv4} from 'uuid'
import {adjectives, animals, colors, NumberDictionary, uniqueNamesGenerator} from 'unique-names-generator'
import {loadGroups, saveGroup} from './group.ts'
import path from 'node:path'
import {homedir} from 'node:os'

export function userTemplate(overrides) {
    const template = {
        _unsaved: true,
        admin: false,
        groups: {
            op: [],
            other: [],
            presenter: [],
        },
        id: uuidv4(),
        name: uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: '-',
            style: 'lowercase',
        }),
        password: uniqueNamesGenerator({
            dictionaries: [adjectives, colors, NumberDictionary.generate({max: 9999, min: 1000})],
            separator: '-',
        }),
    }

    return {...template, ...overrides}
}

export async function loadUsers() {
    // Load users from config file
    const configPath = path.join(homedir(), '.pyriterc')
    if (await fs.pathExists(configPath)) {
        const settings = JSON.parse(await fs.readFile(configPath, 'utf8'))
        return settings.users || []
    }
    return config.users || []
}

export async function loadUser(userId) {
    const users = await loadUsers()
    for (const user of users) {
        if (user.id === userId) return user
    }
    return null
}

export async function saveUser(userId, data) {
    const configPath = path.join(homedir(), '.pyriterc')
    const settings = JSON.parse(await fs.readFile(configPath, 'utf8'))

    let existingUser = false

    for (let [index, user] of settings.users.entries()) {
        if (user.id === userId) {
            settings.users[index] = data
            existingUser = true
        }
    }

    if (!existingUser) {
        logger.debug(`save new user ${userId}`)
        settings.users.push(data)
    } else {
        logger.debug(`updating existing user ${userId}`)
    }

    delete data._unsaved

    await fs.writeFile(configPath, JSON.stringify(settings, null, '  '))
    return data
}

export async function saveUsers(data) {
    const configPath = path.join(homedir(), '.pyriterc')
    const settings = JSON.parse(await fs.readFile(configPath, 'utf8'))
    settings.users = data
    await fs.writeFile(configPath, JSON.stringify(settings, null, '  '))
}

export async function syncUsers() {
    logger.info('syncing users...')
    const {groupNames, groupsData} = await loadGroups()

    // Contains per group the user's that are subscribed.
    const groupsUser = {}
    for (const groupName of groupNames) {
        groupsUser[groupName] = {op: [], other: [], presenter: []}
    }

    const users = await loadUsers()

    for (const user of users) {
        for (const [roleName, role] of Object.entries(user.groups)) {
            for (const [roleIndex, groupName] of role.entries()) {
                if (!groupNames.includes(groupName)) {
                    // Get rid of non-existing groups in settings.users
                    logger.debug(`remove invalid group ${groupName} from user ${user.name}`)
                    role.splice(roleIndex, 1)
                } else {
                    if (!groupsUser[groupName][roleName].includes(user.name)) {
                        groupsUser[groupName][roleName].push({
                            password: user.password,
                            username: user.name,
                        })
                    }
                }
            }
        }
    }

    await saveUsers(users)
    // Update all Galene groups roles with the ones from settings.users
    for (const group of groupsData) {
        Object.assign(group, groupsUser[group._name])
        await saveGroup(group._name, group)
    }
}
