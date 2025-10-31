import {Database} from 'bun:sqlite'
import {initDatabase as initCommonDatabase} from '@garage44/common/lib/database'
import {logger} from '../service.ts'
import path from 'node:path'
import {homedir} from 'node:os'

/**
 * SQLite Database for Pyrite
 * Manages Pyrite-specific tables: channels, channel members, and chat messages
 * Users table is managed by common database initialization
 */

let db: Database | null = null

export interface Channel {
    created_at: number
    description: string
    galene_group: string
    id: number
    name: string
}

export interface ChannelMember {
    channel_id: number
    joined_at: number
    role: string // 'member' | 'admin'
    user_id: string // TEXT to match users.id (UUID string from common database)
}

export interface Message {
    channel_id: number
    id: number
    kind: string // 'message' | 'me' | 'system'
    message: string
    timestamp: number
    user_id: string // TEXT to match users.id (UUID string from common database)
    username: string
}

/**
 * Initialize the database connection and create tables if needed
 * Uses common database initialization for users table
 */
export function initDatabase(dbPath?: string): Database {
    if (db) {
        return db
    }

    const finalPath = dbPath || path.join(homedir(), '.pyrite.db')

    // Initialize common database (creates users table)
    db = initCommonDatabase(finalPath, 'pyrite', logger)

    // Create Pyrite-specific tables
    createPyriteTables()

    return db
}

/**
 * Create Pyrite-specific database tables
 * Users table is created by common database initialization
 */
function createPyriteTables() {
    if (!db) throw new Error('Database not initialized')

    // Channels table
    db.exec(`
        CREATE TABLE IF NOT EXISTS channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            galene_group TEXT NOT NULL,
            created_at INTEGER NOT NULL
        )
    `)

    // Channel members table
    // Note: user_id is TEXT to match users.id (UUID string from common database)
    db.exec(`
        CREATE TABLE IF NOT EXISTS channel_members (
            channel_id INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'member',
            joined_at INTEGER NOT NULL,
            PRIMARY KEY (channel_id, user_id),
            FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `)

    // Messages table
    // Note: user_id is TEXT to match users.id (UUID string from common database)
    db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            channel_id INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            kind TEXT NOT NULL DEFAULT 'message',
            FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `)

    // Create indexes for performance
    db.exec('CREATE INDEX IF NOT EXISTS idx_messages_channel_timestamp ON messages(channel_id, timestamp DESC)')
    db.exec('CREATE INDEX IF NOT EXISTS idx_channel_members_user ON channel_members(user_id)')

    logger.info('[Database] Pyrite-specific tables created successfully')
}

/**
 * Initialize Pyrite-specific default data if database is empty
 * User initialization is handled by UserManager in common service
 */
export function initializeDefaultData() {
    if (!db) throw new Error('Database not initialized')

    // Check if we have any channels
    const channelCount = db.query<{count: number}, []>('SELECT COUNT(*) as count FROM channels').get()

    if (!channelCount || channelCount.count === 0) {
        logger.info('[Database] Initializing Pyrite default data...')

        // Get the admin user ID (created by UserManager)
        const adminUserQuery = db.prepare('SELECT id, username FROM users WHERE username = ?')
        const adminUser = adminUserQuery.get('admin') as {id: string; username: string} | undefined

        if (!adminUser) {
            logger.warn('[Database] Admin user not found, skipping Pyrite default data initialization')
            return
        }

        const now = Date.now()

        // Create default "general" channel
        const channelInsert = db.prepare(`
            INSERT INTO channels (name, description, galene_group, created_at)
            VALUES (?, ?, ?, ?)
        `)
        const channelResult = channelInsert.run('general', 'General discussion channel', 'general', now)
        const channelId = channelResult.lastInsertRowid

        logger.info(`[Database] Created general channel (id: ${channelId})`)

        // Add admin to general channel
        const memberInsert = db.prepare(`
            INSERT INTO channel_members (channel_id, user_id, role, joined_at)
            VALUES (?, ?, ?, ?)
        `)
        memberInsert.run(channelId, adminUser.id, 'admin', now)

        logger.info(`[Database] Added admin user (${adminUser.username}) to general channel`)
    }
}

/**
 * Get database instance
 */
export function getDatabase(): Database {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.')
    }
    return db
}

/**
 * Close database connection
 */
export function closeDatabase() {
    if (db) {
        db.close()
        db = null
        logger.info('[Database] Connection closed')
    }
}
