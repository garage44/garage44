import fs from 'fs-extra'
import path from 'node:path'
import {UserManager, User} from './user-manager'

export interface Group {
  id: string
  name: string
  displayName?: string
  description?: string
  public: boolean
  permissions: {
    'allow-recording'?: boolean
    'allow-subgroups'?: boolean
    'max-clients'?: number
    autolock?: boolean
    codecs?: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface GroupManagerConfig {
  storagePath: string
  userManager: UserManager
}

export class GroupManager {
  private storagePath: string
  private userManager: UserManager

  constructor(config: GroupManagerConfig) {
    this.storagePath = config.storagePath
    this.userManager = config.userManager
  }

  async createGroup(groupData: Partial<Group>): Promise<Group> {
    const group: Group = {
      id: groupData.id || `group-${Date.now()}`,
      name: groupData.name!,
      displayName: groupData.displayName || groupData.name!,
      description: groupData.description || '',
      public: groupData.public ?? true,
      permissions: {
        'allow-recording': true,
        'allow-subgroups': true,
        'max-clients': 10,
        autolock: false,
        codecs: ['opus', 'vp8'],
        ...groupData.permissions
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await this.saveGroupToDisk(group)
    return group
  }

  async updateGroup(groupName: string, updates: Partial<Group>): Promise<Group | null> {
    const group = await this.loadGroupFromDisk(groupName)
    if (!group) return null

    const updatedGroup = {
      ...group,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await this.saveGroupToDisk(updatedGroup)
    return updatedGroup
  }

  async deleteGroup(groupName: string): Promise<boolean> {
    const groupFile = path.join(this.storagePath, `${groupName}.json`)
    if (!await fs.pathExists(groupFile)) return false

    await fs.remove(groupFile)
    return true
  }

  async getGroup(groupName: string): Promise<Group | null> {
    return await this.loadGroupFromDisk(groupName)
  }

  async listGroups(): Promise<Group[]> {
    const files = await fs.readdir(this.storagePath)
    const groups: Group[] = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        const groupName = file.replace('.json', '')
        const group = await this.loadGroupFromDisk(groupName)
        if (group) {
          groups.push(group)
        }
      }
    }

    return groups
  }

  async listPublicGroups(): Promise<Group[]> {
    const groups = await this.listGroups()
    return groups.filter(g => g.public)
  }

  async syncUsersToGroups(): Promise<void> {
    const users = await this.userManager.listUsers()
    const groups = await this.listGroups()

    for (const group of groups) {
      await this.updateGroupWithUsers(group.name, users)
    }
  }

  private async updateGroupWithUsers(groupName: string, users: User[]): Promise<void> {
    const groupFile = path.join(this.storagePath, `${groupName}.json`)
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
  }

  private async loadGroupFromDisk(groupName: string): Promise<Group | null> {
    const groupFile = path.join(this.storagePath, `${groupName}.json`)
    
    if (!await fs.pathExists(groupFile)) {
      return null
    }

    const groupData = JSON.parse(await fs.readFile(groupFile, 'utf8'))
    
    // Convert from Galene format to our Group interface
    return {
      id: groupData.id || `group-${groupName}`,
      name: groupName,
      displayName: groupData.displayName || groupName,
      description: groupData.description || '',
      public: groupData.public ?? true,
      permissions: {
        'allow-recording': groupData['allow-recording'] ?? true,
        'allow-subgroups': groupData['allow-subgroups'] ?? true,
        'max-clients': groupData['max-clients'] ?? 10,
        autolock: groupData.autolock ?? false,
        codecs: groupData.codecs || ['opus', 'vp8']
      },
      createdAt: groupData.createdAt || new Date().toISOString(),
      updatedAt: groupData.updatedAt || new Date().toISOString()
    }
  }

  private async saveGroupToDisk(group: Group): Promise<void> {
    const groupFile = path.join(this.storagePath, `${group.name}.json`)
    
    // Convert from our Group interface to Galene format
    const groupData = {
      id: group.id,
      displayName: group.displayName,
      description: group.description,
      public: group.public,
      'allow-recording': group.permissions['allow-recording'],
      'allow-subgroups': group.permissions['allow-subgroups'],
      'max-clients': group.permissions['max-clients'],
      autolock: group.permissions.autolock,
      codecs: group.permissions.codecs,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      // Initialize empty arrays for Pyrite format
      op: [],
      other: [],
      presenter: [],
      // Initialize empty users dict for native Galene format
      users: {}
    }

    await fs.writeFile(groupFile, JSON.stringify(groupData, null, 2))
  }
}
