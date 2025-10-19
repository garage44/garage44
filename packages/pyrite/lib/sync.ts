import {GroupManager} from '@garage44/common/lib/group-manager'
import {userManager} from './user.ts'
import {config} from './config.ts'
import {logger} from '../service.ts'
import fs from 'fs-extra'
import path from 'node:path'

// Initialize GroupManager for Pyrite
const groupManager = new GroupManager({
  storagePath: path.join(config.sfu.path, 'groups'),
  userManager
})

/**
 * Synchronizes Pyrite users to Galene group files in both formats:
 * 1. Pyrite arrays (op/other/presenter) for internal use
 * 2. Native Galene format (users dictionary) for galenectl compatibility
 */
export async function syncUsersToGalene() {
  try {
    logger.info('Starting user sync to Galene...')
    
    const users = await userManager.listUsers()
    const groups = await loadGroupsFromDisk()
    
    for (const group of groups) {
      await updateGroupWithUsers(group.name, users)
    }
    
    logger.info(`Synced ${users.length} users to ${groups.length} groups`)
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
 * Update a specific group file with user permissions in both formats
 */
async function updateGroupWithUsers(groupName: string, users: any[]) {
  const groupFile = path.join(config.sfu.path, 'groups', `${groupName}.json`)
  let groupData: any = {}

  // Load existing group data if it exists
  if (await fs.pathExists(groupFile)) {
    groupData = JSON.parse(await fs.readFile(groupFile, 'utf8'))
  }

  // Initialize arrays for Pyrite format
  groupData.op = []
  groupData.other = []
  groupData.presenter = []

  // Initialize users dictionary for native Galene format
  groupData.users = {}

  // Process users and their group permissions
  for (const user of users) {
    const userGroups = user.permissions.groups || {}
    const roles = userGroups[groupName] || []

    // Update Pyrite arrays
    for (const role of roles) {
      if (role === 'op' && !groupData.op.includes(user.username)) {
        groupData.op.push(user.username)
      } else if (role === 'presenter' && !groupData.presenter.includes(user.username)) {
        groupData.presenter.push(user.username)
      } else if (role === 'other' && !groupData.other.includes(user.username)) {
        groupData.other.push(user.username)
      }
    }

    // Update native Galene format
    if (roles.length > 0) {
      groupData.users[user.username] = {
        password: user.password, // Already in Galene format
        permissions: roles[0] // Primary role
      }
    }
  }

  // Save the group file
  await fs.writeFile(groupFile, JSON.stringify(groupData, null, 2))
  logger.debug(`Updated group ${groupName} with ${Object.keys(groupData.users).length} users`)
}

/**
 * Legacy function for backward compatibility
 */
export async function syncUsers() {
  return await syncUsersToGalene()
}

// Export the GroupManager instance for direct access if needed
export { groupManager }
