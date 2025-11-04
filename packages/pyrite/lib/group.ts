import {config} from './config.ts'
import {logger} from '../service.ts'
import {dictionary} from './utils.ts'
import {userManager} from '@garage44/common/service'
import fs from 'fs-extra'
import {Glob} from 'bun'
import path from 'node:path'
import {uniqueNamesGenerator} from 'unique-names-generator'

const ROLES = ['op', 'other', 'presenter']

// Helper functions to use UserManager from service
const loadUsers = () => userManager.listUsers()
const saveUsers = async (users) => {
    // Save users by updating each user individually
    for (const user of users) {
        await userManager.updateUser(user.id || user.username || user.name, user)
    }
}

// Public group data Exposed on /api/groups/public
const PUBLIC_GROUP_FIELDS = [
    'allow-anonymous',
    'allow-recording',
    'allow-subgroups',
    'autokick',
    'autolock',
    'codecs',
    'comment',
    'contact',
    'description',
    'displayName',
    'max-clients',
    'max-history-age',
    'public-access',
]

export function groupTemplate(groupId = null) {
    const baseName = groupId ?? uniqueNamesGenerator({
        dictionaries: [dictionary.adjs, dictionary.nouns],
        length: 2,
        separator: '-',
        style: 'lowercase',
    })

    const template = {
        _name: baseName,
        _permissions: {},
        _unsaved: true,
        'allow-anonymous': false,
        'allow-recording': true,
        'allow-subgroups': true,
        autokick: false,
        autolock: false,
        codecs: ['opus', 'vp8'],
        comment: '',
        contact: '',
        description: '',
        displayName: '',
        'max-clients': 10,
        'max-history-age': 14400,
        op: [],
        other: [],
        presenter: [],
        public: true,
        'public-access': false,
        redirect: '',
    }

    template._newName = template._name
    return template
}

export async function loadGroupPermissions(groupName) {
    const permissions = {op: [], other: [], presenter: []}
    // Permissions from a group perspective; transformed from settings.users
    const users = await loadUsers()
    for (const user of users) {
        // Handle both old format (user.groups) and new format (user.permissions.groups)
        const userGroups = user.permissions?.groups || user.groups || {}
        for (const permissionName of Object.keys(userGroups)) {
            for (const _groupName of userGroups[permissionName]) {
                if (groupName === _groupName) {
                    permissions[permissionName].push(user.username || user.name)
                }
            }
        }
    }
    return permissions
}

export async function saveGroupPermissions(groupName, groupPermissions) {
    // Save the group permissions to settings.users and
    // sync back to the group files afterwards.
    const users = await loadUsers()
    for (const permissionName of Object.keys(groupPermissions)) {

        for (const user of users) {
            let userGroupMatch = false
            for (const username of groupPermissions[permissionName]) {
                if (user.name === username) {
                    userGroupMatch = true
                    if (!user.groups[permissionName].includes(groupName)) {
                        user.groups[permissionName].push(groupName)
                    }
                }
            }

            if (!userGroupMatch && user.groups[permissionName].includes(groupName)) {
                user.groups[permissionName].splice(user.groups[permissionName].indexOf(groupName), 1)
            }
        }
    }

    await saveUsers(users)
}

export async function loadGroup(groupName) {
    logger.debug(`load group ${groupName}`)
    const groupFile = path.join(config.sfu.path, 'groups', `${groupName}.json`)
    const exists = await fs.pathExists(groupFile)
    if (!exists) return null
    const groupData = JSON.parse(await fs.promises.readFile(groupFile, 'utf8'))

    /*
     * PYRITE GROUP LOADING - Handle Multiple Formats
     *
     * Pyrite must handle both:
     * 1. Pyrite-managed groups: Have op/other/presenter arrays (synchronized)
     * 2. Native Galene groups: Have users dictionary (created externally)
     *
     * For native Galene groups, we read them in read-only mode for display purposes.
     * They won't be editable in Pyrite admin until converted/synchronized.
     */

    // Initialize arrays for Pyrite's internal format (defensive coding)
    if (!groupData.op) groupData.op = []
    if (!groupData.other) groupData.other = []
    if (!groupData.presenter) groupData.presenter = []

    // Detect native Galene format and extract user info for read-only display
    let isNativeGaleneFormat = false
    if (groupData.users && typeof groupData.users === 'object' && !Array.isArray(groupData.users)) {
        isNativeGaleneFormat = true
        // Extract usernames for display (but don't sync back - this is read-only)
        for (const [username, userConfig] of Object.entries(groupData.users)) {
            const permission = userConfig.permissions || 'other'
            // Map for internal display only
            if (permission === 'op' && !groupData.op.includes(username)) {
                groupData.op.push(username)
            } else if (permission === 'present' && !groupData.presenter.includes(username)) {
                groupData.presenter.push(username)
            } else if (!groupData.other.includes(username)) {
                groupData.other.push(username)
            }
        }
    }

    // Handle public access field
    // Native Galene uses 'wildcard-user', Pyrite manages 'public-access' boolean
    if (groupData['wildcard-user']) {
        groupData['public-access'] = true
    } else if (groupData.other) {
        // Pyrite legacy: empty object in 'other' array means public access
        const public_access_idx = groupData.other.findIndex(
            (obj) => obj && typeof obj === 'object' && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype,
        )
        if (public_access_idx === -1) {
            groupData['public-access'] = false
        } else {
            groupData['public-access'] = true
            groupData.other.splice(public_access_idx, 1)
        }
    }

    // Load Pyrite's managed permissions from settings.users (source of truth)
    groupData._permissions = await loadGroupPermissions(groupName)

    // Internal metadata
    groupData._name = groupName
    groupData._newName = groupName
    groupData._delete = false
    groupData._unsaved = false
    groupData._isNativeGalene = isNativeGaleneFormat  // Flag for UI to show read-only state

    return groupData
}

export async function loadGroups(publicEndpoint = false) {
    const endpoint = `${config.sfu.url}/public-groups.json`
    console.log(`load groups: ${endpoint}`)
    // Galene group endpoint; contains client count and locked info. Add it
    // to the more static Pyrite group info.
    let galeneGroups
    try {
        galeneGroups = await (await fetch(endpoint)).json()
    } catch (err) {
        galeneGroups = []
    }

    const groupsPath = path.join(config.sfu.path, 'groups')

    const glob = new Glob('**/*.json')
    const files = Array.from(glob.scanSync(groupsPath)).map((f) => path.join(groupsPath, f))
    const groupNames = files.map((i) => i.slice(groupsPath.length + 1, -5))
    const fileData = await Promise.all(groupNames.map((i) => loadGroup(i)))

    const groupsData = []
    for (const [index, groupName] of groupNames.entries()) {
        const groupData = fileData[index]
        let data = {}

        if (publicEndpoint) {
            // name, description, clientCount
            for (const [key, value] of Object.entries(groupData)) {
                if (key === 'public' && value === false) {
                    continue
                }

                if (PUBLIC_GROUP_FIELDS.includes(key)) {
                    data[key] = value
                }
            }
        } else {
            data = groupData
        }

        const galeneGroup = galeneGroups.find((i) => i.name === groupName)
        if (galeneGroup) {
            Object.assign(data, {
                clientCount: galeneGroup.clientCount,
                locked: Boolean(galeneGroup.locked),
                name: groupName,
            })
        }

        groupsData.push(data)

    }

    return {groupNames, groupsData}
}

export async function pingGroups(groupNames) {
    logger.debug(`ping groups: ${groupNames}`)
    await Promise.all(groupNames.map((i) => fetch(`${config.sfu.url}/group/${i}`)))
}

export async function renameGroup(oldGroupName, newGroupName) {
    const users = await loadUsers()
    for (const user of users) {
        for (const role of Object.values(user.groups)) {
            for (const [roleIndex, groupName] of role.entries()) {
                if (groupName === oldGroupName) {
                    role[roleIndex] = newGroupName
                    logger.debug(`rename old user group ${oldGroupName} => ${newGroupName}`)
                }
            }
        }
    }

    await saveUsers(users)
}

export async function saveGroup(groupName, data) {
    const saveData = JSON.parse(JSON.stringify(data))
    // Remove non-group data.
    delete saveData.name
    delete saveData.clientCount
    delete saveData.locked

    if (saveData['public-access'] === true) {
        saveData.other.push({})
    } else {
        const public_access_idx = saveData.other.findIndex(
            (obj) => obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype)
        if (public_access_idx !== -1) {
            saveData.other.splice(public_access_idx, 1)
        }
    }
    delete saveData['public-access']

    await saveGroupPermissions(groupName, saveData._permissions)

    // All actions not directly related to the Galene file format
    // should go before removing the private variables.
    for (const key of Object.keys(saveData)) {
        if (key.startsWith('_')) delete saveData[key]
    }

    const groupsPath = path.join(config.sfu.path, 'groups')
    const currentGroupFile = path.join(groupsPath, `${data._name}.json`)
    if (data._name === data._newName) {
        logger.debug(`save group ${groupName}`)
        await fs.promises.writeFile(currentGroupFile, JSON.stringify(saveData, null, '  '))
        return {data, groupId: data._name}
    }

    logger.debug(`save and rename group ${groupName}`)
    const newGroupFile = path.join(groupsPath, `${data._newName}.json`)
    // Sync current group file in group definitions and settings.users
    await renameGroup(data._name, data._newName)
    await fs.remove(currentGroupFile)

    await fs.promises.writeFile(newGroupFile, JSON.stringify(saveData, null, '  '))
    return {data, groupId: data._newName}
}

/**
 * Updates users in settings.users from a Galène group.
 */
export async function syncGroup(groupId, groupData) {
    logger.debug(`sync group ${groupId}`)
    const users = await loadUsers()
    let changed = false
    for (const role of ROLES) {
        for (const username of groupData[role]) {
            const _user = users.find((i) => i.name === username)
            // User from groups definition is in settings.users;
            // Make sure the group is there as well...
            if (_user && !_user.groups[role].includes(groupId)) {
                logger.debug(`add group ${groupId} to user ${_user.name}`)
                _user.groups[role].push(groupId)
                changed = true
            }
        }
    }

    if (changed) await saveUsers(users)

}
