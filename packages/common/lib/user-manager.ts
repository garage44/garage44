import {v4 as uuidv4} from 'uuid'
import fs from 'fs-extra'
import path from 'node:path'
import {homedir} from 'node:os'

export interface User {
  id: string
  username: string
  email?: string
  password: {
    type: 'plaintext' | 'bcrypt'
    key: string
  }
  profile: {
    displayName: string
    avatar?: string | null
  }
  permissions: {
    admin: boolean
    groups?: Record<string, string[]>
  }
  createdAt: string
  updatedAt: string
}

export interface UserManagerConfig {
  configPath: string
  appName: string
  useBcrypt?: boolean
}

export class UserManager {
  private configPath: string
  private appName: string
  private useBcrypt: boolean

  constructor(config: UserManagerConfig) {
    this.configPath = config.configPath.replace('~', homedir())
    this.appName = config.appName
    this.useBcrypt = config.useBcrypt ?? false
  }

  async initialize(): Promise<void> {
    const users = await this.loadUsers()

    if (users.length === 0) {
      console.log('No users found, creating default admin user...')
      await this.createDefaultAdmin()
    }
  }

  private async createDefaultAdmin(): Promise<void> {
    const defaultUser: User = {
      id: uuidv4(),
      username: 'admin',
      email: 'admin@localhost',
      password: {
        type: 'plaintext',
        key: 'admin'
      },
      profile: {
        displayName: 'Administrator',
        avatar: null
      },
      permissions: {
        admin: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await this.createUser(defaultUser)
    console.log('✓ Default admin user created (username: admin, password: admin)')
    console.log('⚠ Please change the default password immediately!')
  }

  async loadUsers(): Promise<User[]> {
    if (!await fs.pathExists(this.configPath)) {
      return []
    }

    const config = JSON.parse(await fs.readFile(this.configPath, 'utf8'))
    return config.users || []
  }

  async saveUsers(users: User[]): Promise<void> {
    const config = await this.loadConfig()
    config.users = users
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2))
  }

  private async loadConfig(): Promise<any> {
    if (await fs.pathExists(this.configPath)) {
      return JSON.parse(await fs.readFile(this.configPath, 'utf8'))
    }
    return {}
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const users = await this.loadUsers()

    const user: User = {
      id: uuidv4(),
      username: userData.username!,
      email: userData.email,
      password: userData.password || {
        type: 'plaintext',
        key: 'password'
      },
      profile: {
        displayName: userData.profile?.displayName || userData.username!,
        avatar: userData.profile?.avatar || null
      },
      permissions: userData.permissions || {
        admin: false,
        groups: {}
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    users.push(user)
    await this.saveUsers(users)
    return user
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.loadUsers()
    const userIndex = users.findIndex(u => u.id === userId)

    if (userIndex === -1) return null

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      id: users[userIndex].id, // Don't allow changing ID
      updatedAt: new Date().toISOString()
    }

    await this.saveUsers(users)
    return users[userIndex]
  }

  async deleteUser(userId: string): Promise<boolean> {
    const users = await this.loadUsers()
    const filteredUsers = users.filter(u => u.id !== userId)

    if (filteredUsers.length === users.length) return false

    await this.saveUsers(filteredUsers)
    return true
  }

  async getUser(userId: string): Promise<User | null> {
    const users = await this.loadUsers()
    return users.find(u => u.id === userId) || null
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.loadUsers()
    return users.find(u => u.username === username) || null
  }

  async listUsers(): Promise<User[]> {
    return await this.loadUsers()
  }

  async authenticate(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username)
    if (!user) return null

    const isValid = await this.validatePassword(user, password)
    return isValid ? user : null
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (user.password.type === 'plaintext') {
      return user.password.key === password
    }

    if (user.password.type === 'bcrypt') {
      // For now, just compare plaintext for development
      // TODO: Implement proper bcrypt validation
      return user.password.key === password
    }

    return false
  }

  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    const user = await this.getUser(userId)
    if (!user) return false

    const passwordObj = this.useBcrypt
      ? { type: 'bcrypt' as const, key: newPassword } // TODO: Hash with bcrypt
      : { type: 'plaintext' as const, key: newPassword }

    await this.updateUser(userId, { password: passwordObj })
    return true
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.getUser(userId)
    if (!user) return false

    if (permission === 'admin') {
      return user.permissions.admin
    }

    return false
  }

  async getUserGroups(userId: string): Promise<Record<string, string[]>> {
    const user = await this.getUser(userId)
    return user?.permissions.groups || {}
  }

  async grantGroupPermission(userId: string, groupName: string, role: string): Promise<boolean> {
    const user = await this.getUser(userId)
    if (!user) return false

    const groups = user.permissions.groups || {}
    if (!groups[groupName]) {
      groups[groupName] = []
    }

    if (!groups[groupName].includes(role)) {
      groups[groupName].push(role)
    }

    await this.updateUser(userId, { permissions: { ...user.permissions, groups } })
    return true
  }

  async revokeGroupPermission(userId: string, groupName: string, role: string): Promise<boolean> {
    const user = await this.getUser(userId)
    if (!user) return false

    const groups = user.permissions.groups || {}
    if (groups[groupName]) {
      groups[groupName] = groups[groupName].filter(r => r !== role)
      if (groups[groupName].length === 0) {
        delete groups[groupName]
      }
    }

    await this.updateUser(userId, { permissions: { ...user.permissions, groups } })
    return true
  }
}
