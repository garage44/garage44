import {UserManager, User} from '@garage44/common/lib/user-manager'
import {config} from './config.ts'
import {logger} from '../service.ts'

// Initialize UserManager for Expressio
const userManager = new UserManager({
    appName: 'expressio',
    configPath: '~/.expressiorc',
    useBcrypt: false, // Start with plaintext for development
})

// Initialize UserManager when called
let isInitialized = false

export async function initializeUserManager() {
    if (isInitialized) {
        return
    }

    try {
        logger.info('Initializing UserManager...')
        await userManager.initialize()
        logger.info('UserManager initialized successfully')
        isInitialized = true
    } catch (err) {
        logger.error('Failed to initialize UserManager:', err)
        throw err
    }
}

// Re-export UserManager methods with Expressio-specific logging
export async function loadUsers() {
    try {
        return await userManager.listUsers()
    } catch (error) {
        logger.error('Failed to load users:', error)
        return []
    }
}

export async function loadUser(userId: string) {
    try {
        return await userManager.getUser(userId)
    } catch (error) {
        logger.error(`Failed to load user ${userId}:`, error)
        return null
    }
}

export async function saveUser(userId: string, data: User) {
    try {
        const result = await userManager.updateUser(userId, data)
        if (result) {
            logger.debug(`Updated user ${userId}`)
        }
        return result
    } catch (error) {
        logger.error(`Failed to save user ${userId}:`, error)
        throw error
    }
}

export async function saveUsers(users: User[]) {
    try {
    // This is a bulk operation - we need to update each user individually
    // since UserManager doesn't have a bulk update method
        for (const user of users) {
            await userManager.updateUser(user.id, user)
        }
        logger.debug(`Updated ${users.length} users`)
    } catch (error) {
        logger.error('Failed to save users:', error)
        throw error
    }
}

export async function createUser(userData: Partial<User>) {
    try {
        const user = await userManager.createUser(userData)
        logger.debug(`Created user ${user.username}`)
        return user
    } catch (error) {
        logger.error('Failed to create user:', error)
        throw error
    }
}

export async function deleteUser(userId: string) {
    try {
        const success = await userManager.deleteUser(userId)
        if (success) {
            logger.debug(`Deleted user ${userId}`)
        }
        return success
    } catch (error) {
        logger.error(`Failed to delete user ${userId}:`, error)
        throw error
    }
}

export async function authenticateUser(username: string, password: string) {
    try {
        logger.info(`Attempting to authenticate user: ${username}`)

        // Debug: List all users in UserManager
        const allUsers = await userManager.listUsers()
        logger.info(`Available users in UserManager: ${allUsers.map((u) => u.username).join(', ')}`)

        const result = await userManager.authenticate(username, password)
        if (result) {
            logger.info(`Authentication successful for user: ${username}`)
        } else {
            logger.info(`Authentication failed for user: ${username} - user not found or password incorrect`)
        }
        return result
    } catch (error) {
        logger.error(`Authentication failed for ${username}:`, error)
        return null
    }
}

export async function getUserByUsername(username: string) {
    try {
        return await userManager.getUserByUsername(username)
    } catch (error) {
        logger.error(`Failed to get user by username ${username}:`, error)
        return null
    }
}

export async function hasPermission(userId: string, permission: string) {
    try {
        return await userManager.hasPermission(userId, permission)
    } catch (error) {
        logger.error(`Failed to check permission ${permission} for user ${userId}:`, error)
        return false
    }
}

// Expressio-specific helper functions
export async function isAdmin(userId: string) {
    return await hasPermission(userId, 'admin')
}

export async function getUserByUsernameOrEmail(identifier: string) {
    try {
    // First try by username
        let user = await userManager.getUserByUsername(identifier)
        if (user) return user

        // Then try by email
        const users = await userManager.listUsers()
        user = users.find((u) => u.email === identifier) || null
        return user
    } catch (error) {
        logger.error(`Failed to get user by identifier ${identifier}:`, error)
        return null
    }
}

// Export the UserManager instance for direct access if needed
export {userManager}
