import {GroupManager} from '@garage44/common/lib/group-manager'
import {userManager} from '@garage44/common/service'
import {config} from './config.ts'
import {logger} from '../service.ts'
import fs from 'fs-extra'
import path from 'node:path'
import {getDatabase} from './database.ts'
import {Database} from 'bun:sqlite'

// Initialize GroupManager for Pyrite
// Note: userManager is the shared instance from common/service, already initialized with database
const groupManager = new GroupManager({
  storagePath: config.sfu.path ? path.join(config.sfu.path, 'groups') : '',
  userManager
})

/**
 * Synchronizes Pyrite users to Galene:
 * 1. Admin users to global config.json (data/config.json)
 * 2. Channel members to group files (users dictionary in each group file)
 */
export async function syncUsersToGalene() {
  try {
    logger.info('Starting user sync to Galene...')

    // Check if SFU path is configured
    if (!config.sfu.path) {
      logger.warn('[Sync] SFU path not configured (config.sfu.path is null). Skipping user sync to Galene.')
      logger.warn('[Sync] Please set config.sfu.path in your .pyriterc file or environment variables.')
      return
    }

    const users = await userManager.listUsers()
    const db = getDatabase()

    // 1. Sync ALL users to global config.json
    await syncUsersToGlobalConfig(users, db)

    // 2. Sync channel members to group files
    const groups = await loadGroupsFromDisk()
    for (const group of groups) {
      await updateGroupWithChannelMembers(group.name, db)
    }

    logger.info(`Synced ${users.length} users to global config and ${groups.length} groups`)
  } catch (error) {
    logger.error('Failed to sync users to Galene:', error)
    throw error
  }
}

/**
 * Load all groups from the Galene groups directory
 */
async function loadGroupsFromDisk() {
  const groupsPath = path.join(config.sfu.path, 'groups')
  const files = await fs.readdir(groupsPath)
  const groups: any[] = []

  for (const file of files) {
    if (file.endsWith('.json')) {
      const groupName = file.replace('.json', '')
      const groupFile = path.join(groupsPath, file)
      const groupData = JSON.parse(await fs.readFile(groupFile, 'utf8'))
      groups.push({
        name: groupName,
        ...groupData
      })
    }
  }

  return groups
}

/**
 * Sync ALL users to Galene global config.json
 * Path: config.sfu.path/data/config.json
 * Format: {"users": {"username": {"password": "...", "permissions": "admin"}}}
 */
async function syncUsersToGlobalConfig(users: any[], db: Database) {
  const configFile = path.join(config.sfu.path, 'data', 'config.json')

  // Ensure data directory exists
  const dataDir = path.join(config.sfu.path, 'data')
  await fs.ensureDir(dataDir)

  // Load existing config or create new
  let galeneConfig: any = {}
  if (await fs.pathExists(configFile)) {
    galeneConfig = JSON.parse(await fs.readFile(configFile, 'utf8'))
  }

  // Initialize users dictionary
  if (!galeneConfig.users) {
    galeneConfig.users = {}
  }

  // Sync ALL users
  for (const user of users) {
    // Convert password to Galene format
    let password: string | {type: string; key: string} = user.password.key

    // If password is hashed, keep the hash format; otherwise use plaintext
    if (user.password.type === 'bcrypt') {
      password = {
        type: 'bcrypt',
        key: user.password.key
      }
    }

    // All users in global config get admin permission (for server administration)
    galeneConfig.users[user.username] = {
      password: password,
      permissions: 'admin'
    }
  }

  // Remove users that no longer exist
  const existingUsernames = new Set(users.map(u => u.username))
  for (const username of Object.keys(galeneConfig.users)) {
    if (!existingUsernames.has(username)) {
      delete galeneConfig.users[username]
    }
  }

  // Preserve other config fields (canonicalHost, writableGroups, etc.)
  // Only update the users field

  // Save the config file
  await fs.writeFile(configFile, JSON.stringify(galeneConfig, null, 2))
  logger.info(`Synced ${users.length} users to Galene global config`)
}

/**
 * Update a specific group file with channel members
 * Maps channel members (from channel_members table) to Galene group users
 * Channel slug -> Group name (1:1 mapping)
 * Channel role: admin -> Galene permission 'op', member -> Galene permission 'present'
 */
async function updateGroupWithChannelMembers(groupName: string, db: Database) {
  const groupFile = path.join(config.sfu.path, 'groups', `${groupName}.json`)

  // Skip if group file doesn't exist (should be created by channel sync)
  if (!await fs.pathExists(groupFile)) {
    logger.debug(`Group file ${groupName}.json doesn't exist, skipping user sync`)
    return
  }

  let groupData: any = JSON.parse(await fs.readFile(groupFile, 'utf8'))

  // Initialize arrays for Pyrite format
  if (!groupData.op) groupData.op = []
  if (!groupData.other) groupData.other = []
  if (!groupData.presenter) groupData.presenter = []

  // Initialize users dictionary for native Galene format
  groupData.users = {}

  // Find channel by slug (groupName is the channel slug)
  const channelStmt = db.prepare('SELECT id FROM channels WHERE slug = ?')
  const channel = channelStmt.get(groupName) as {id: number} | null

  if (!channel) {
    // No channel found for this group - clear users
    logger.debug(`No channel found for group ${groupName}, clearing users`)
    groupData.op = []
    groupData.other = []
    groupData.presenter = []
    groupData.users = {}
    await fs.writeFile(groupFile, JSON.stringify(groupData, null, 2))
    return
  }

  // Get channel members with user details
  const membersStmt = db.prepare(`
    SELECT cm.role, u.username, u.id
    FROM channel_members cm
    INNER JOIN users u ON cm.user_id = u.id
    WHERE cm.channel_id = ?
  `)
  const members = membersStmt.all(channel.id) as Array<{role: string; username: string; id: string}>

  // Get user details (password) from UserManager
  const allUsers = await userManager.listUsers()
  const userMap = new Map(allUsers.map(u => [u.id, u]))

  // Process channel members
  for (const member of members) {
    const user = userMap.get(member.id)
    if (!user) {
      logger.warn(`User ${member.id} not found in UserManager, skipping`)
      continue
    }

    // Map channel role to Galene permission
    let galenePermission: string
    if (member.role === 'admin') {
      galenePermission = 'op'
      if (!groupData.op.includes(user.username)) {
        groupData.op.push(user.username)
      }
    } else {
      galenePermission = 'present'
      if (!groupData.other.includes(user.username)) {
        groupData.other.push(user.username)
      }
    }

    // Convert password to Galene format
    let password: string | {type: string; key: string} = user.password.key

    // If password is hashed, keep the hash format; otherwise use plaintext
    if (user.password.type === 'bcrypt') {
      password = {
        type: 'bcrypt',
        key: user.password.key
      }
    }

    // Add to native Galene format
    groupData.users[user.username] = {
      password: password,
      permissions: galenePermission
    }
  }

  // Save the group file in native Galene format (without op/other/presenter arrays)
  await saveGroupNativeGalene(groupName, groupData)
  logger.debug(`Updated group ${groupName} with ${Object.keys(groupData.users).length} users from channel members`)
}

/**
 * Save group file in native Galene format (without Pyrite-specific op/other/presenter arrays)
 * Galene only understands the native format with users dictionary
 */
async function saveGroupNativeGalene(groupName: string, groupData: any): Promise<void> {
  // Create a clean copy without Pyrite-specific fields
  const nativeData: any = {
    // Copy all native Galene fields
    'allow-anonymous': groupData['allow-anonymous'] ?? false,
    'allow-recording': groupData['allow-recording'] ?? true,
    'allow-subgroups': groupData['allow-subgroups'] ?? true,
    autokick: groupData.autokick ?? false,
    autolock: groupData.autolock ?? false,
    codecs: groupData.codecs ?? ['opus', 'vp8'],
    comment: groupData.comment ?? '',
    contact: groupData.contact ?? '',
    description: groupData.description ?? '',
    displayName: groupData.displayName ?? groupName,
    'max-clients': groupData['max-clients'] ?? 10,
    'max-history-age': groupData['max-history-age'] ?? 14400,
    public: groupData.public ?? false,
  }

  // Handle wildcard-user for public access (native Galene format)
  if (groupData['allow-anonymous'] || groupData.public) {
    nativeData['wildcard-user'] = {
      password: {type: 'wildcard'},
      permissions: 'present'
    }
  }

  // Include users dictionary if it exists (required for Galene)
  if (groupData.users && typeof groupData.users === 'object' && !Array.isArray(groupData.users)) {
    nativeData.users = groupData.users
  } else {
    // Ensure users dictionary exists (even if empty)
    nativeData.users = {}
  }

  // Remove any Pyrite-specific fields that shouldn't be in the file
  // (op, other, presenter arrays are for Pyrite internal use only)

  // Write the native Galene format file
  const groupFile = path.join(config.sfu.path, 'groups', `${groupName}.json`)
  await fs.writeFile(groupFile, JSON.stringify(nativeData, null, 2))
}

/**
 * Legacy function for backward compatibility
 */
export async function syncUsers() {
  return await syncUsersToGalene()
}

// Export the GroupManager instance for direct access if needed
export { groupManager }
