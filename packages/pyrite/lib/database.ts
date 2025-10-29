import {Database} from 'bun:sqlite'
import {logger} from '../service.ts'
import path from 'node:path'
import {homedir} from 'node:os'

/**
 * SQLite Database for Pyrite
 * Manages users, channels, channel members, and chat messages
 */

let db: Database | null = null

export interface User {
    created_at: number
    id: number
    password_hash: string
    permissions: string // JSON string: {admin: boolean}
    updated_at: number
    username: string
}

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
    user_id: number
}

export interface Message {
    channel_id: number
    id: number
    kind: string // 'message' | 'me' | 'system'
    message: string
    timestamp: number
    user_id: number
    username: string
}

/**
 * Initialize the database connection and create tables if needed
 */
export function initDatabase(dbPath?: string): Database {
    if (db) {
        return db
    }

    const finalPath = dbPath || path.join(homedir(), '.pyrite.db')
    logger.info(`[Database] Initializing SQLite database at ${finalPath}`)

    db = new Database(finalPath, {create: true})

    // Enable WAL mode for better concurrent access
    db.exec('PRAGMA journal_mode = WAL')
    db.exec('PRAGMA foreign_keys = ON')

    createTables()
    return db
}

/**
 * Create database tables
 */
function createTables() {
    if (!db) throw new Error('Database not initialized')

    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            permissions TEXT NOT NULL DEFAULT '{}',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    `)

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
    db.exec(`
        CREATE TABLE IF NOT EXISTS channel_members (
            channel_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            role TEXT NOT NULL DEFAULT 'member',
            joined_at INTEGER NOT NULL,
            PRIMARY KEY (channel_id, user_id),
            FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `)

    // Messages table
    db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            channel_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
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

    logger.info('[Database] Tables created successfully')
}

/**
 * Initialize default data if database is empty
 */
export function initializeDefaultData() {
    if (!db) throw new Error('Database not initialized')

    // Check if we have any users
    const userCount = db.query<{count: number}, []>('SELECT COUNT(*) as count FROM users').get()

    if (!userCount || userCount.count === 0) {
        logger.info('[Database] Initializing default data...')

        // Create default admin user (password: admin)
        // Note: In production, this should be a proper bcrypt hash
        const adminHash = 'admin' // Use proper password hashing in production
        const now = Date.now()

        const adminInsert = db.prepare(`
            INSERT INTO users (username, password_hash, permissions, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `)
        const adminResult = adminInsert.run('admin', adminHash, JSON.stringify({admin: true}), now, now)
        const adminId = adminResult.lastInsertRowid

        logger.info(`[Database] Created admin user (id: ${adminId})`)

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
        memberInsert.run(channelId, adminId, 'admin', now)

        logger.info('[Database] Added admin to general channel')
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
