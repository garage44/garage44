import fs from 'fs-extra'
import {homedir} from 'node:os'

export interface User {
    createdAt: string
    email?: string
    id: string
    password: {
        key: string
        type: 'plaintext' | 'bcrypt'
    }
    permissions: {
        admin: boolean
        groups?: Record<string, string[]>
    }
    profile: {
        avatar?: string | null
        displayName: string
    }
    updatedAt: string
    username: string
}

export interface UserManagerConfig {
    appName: string
    configPath: string
    useBcrypt?: boolean
}

export class UserManager {
    private configPath: string
    private appName: string
    private useBcrypt: boolean

    constructor() {
        // Initialize with defaults, will be configured via init()
        this.configPath = ''
        this.appName = ''
        this.useBcrypt = false
    }

    async init(config: UserManagerConfig) {
        this.configPath = config.configPath.replace('~', homedir())
        this.appName = config.appName
        this.useBcrypt = config.useBcrypt ?? false

        const users = await this.loadUsers()
        if (users.length === 0) {
            await this.createDefaultAdmin()
        }
    }

    async initialize() {
        const users = await this.loadUsers()
        if (users.length === 0) {
            await this.createDefaultAdmin()
        }
    }

    private async createDefaultAdmin() {
        const defaultUser: User = {
            createdAt: new Date().toISOString(),
            email: 'admin@localhost',
            id: crypto.randomUUID(),
            password: {
                key: 'admin',
                type: 'plaintext',
            },
            permissions: {
                admin: true,
            },
            profile: {
                avatar: null,
                displayName: 'Administrator',
            },
            updatedAt: new Date().toISOString(),
            username: 'admin',
        }

        await this.createUser(defaultUser)
    }

    async loadUsers(): Promise<User[]> {
        if (!await fs.pathExists(this.configPath)) {
            return []
        }

        const config = JSON.parse(await fs.readFile(this.configPath, 'utf8'))
        return config.users || []
    }

    async saveUsers(users: User[]) {
        const config = await this.loadConfig()
        config.users = users
        await fs.writeFile(this.configPath, JSON.stringify(config, null, 2))
    }

    private async loadConfig() {
        if (await fs.pathExists(this.configPath)) {
            return JSON.parse(await fs.readFile(this.configPath, 'utf8'))
        }
        return {}
    }

    async createUser(userData: Partial<User>): Promise<User> {
        const users = await this.loadUsers()

        const user: User = {
            createdAt: new Date().toISOString(),
            email: userData.email,
            id: crypto.randomUUID(),
            password: userData.password || {
                key: 'password',
                type: 'plaintext',
            },
            permissions: userData.permissions || {
                admin: false,
                groups: {},
            },
            profile: {
                avatar: userData.profile?.avatar || null,
                displayName: userData.profile?.displayName || userData.username!,
            },
            updatedAt: new Date().toISOString(),
            username: userData.username!,
        }

        users.push(user)
        await this.saveUsers(users)
        return user
    }

    async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
        const users = await this.loadUsers()
        const userIndex = users.findIndex((u) => u.id === userId)

        if (userIndex === -1) return null

        users[userIndex] = {
            ...users[userIndex],
            ...updates,
            id: users[userIndex].id, // Don't allow changing ID
            updatedAt: new Date().toISOString(),
        }

        await this.saveUsers(users)
        return users[userIndex]
    }

    async deleteUser(userId: string): Promise<boolean> {
        const users = await this.loadUsers()
        const filteredUsers = users.filter((u) => u.id !== userId)

        if (filteredUsers.length === users.length) return false

        await this.saveUsers(filteredUsers)
        return true
    }

    async getUser(userId: string): Promise<User | null> {
        const users = await this.loadUsers()
        return users.find((u) => u.id === userId) || null
    }

    async getUserByUsername(username: string): Promise<User | null> {
        const users = await this.loadUsers()
        return users.find((u) => u.username === username) || null
    }

    async listUsers(): Promise<User[]> {
        return await this.loadUsers()
    }

    async authenticate(username: string, password: string): Promise<User | null> {
        const user = await this.getUserByUsername(username)

        if (!user) {
            return null
        }

        const isValid = await this.validatePassword(user, password)
        return isValid ? user : null
    }

    async validatePassword(user: User, password: string): Promise<boolean> {
        if (user.password.type === 'plaintext') {
            const isMatch = user.password.key === password
            return isMatch
        }

        if (user.password.type === 'bcrypt') {
            return user.password.key === password
        }

        return false
    }

    async updatePassword(userId: string, newPassword: string): Promise<boolean> {
        const user = await this.getUser(userId)
        if (!user) return false

        const passwordObj = this.useBcrypt
            ? {key: newPassword, type: 'bcrypt' as const} // TODO: Hash with bcrypt
            : {key: newPassword, type: 'plaintext' as const}

        await this.updateUser(userId, {password: passwordObj})
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

        await this.updateUser(userId, {permissions: {...user.permissions, groups}})
        return true
    }

    async revokeGroupPermission(userId: string, groupName: string, role: string): Promise<boolean> {
        const user = await this.getUser(userId)
        if (!user) return false

        const groups = user.permissions.groups || {}
        if (groups[groupName]) {
            groups[groupName] = groups[groupName].filter((r) => r !== role)
            if (groups[groupName].length === 0) {
                delete groups[groupName]
            }
        }

        await this.updateUser(userId, {permissions: {...user.permissions, groups}})
        return true
    }
}
