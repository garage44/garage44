import {Database} from 'bun:sqlite'
import path from 'node:path'
import {homedir} from 'node:os'
import fs from 'fs-extra'

/**
 * Common database initialization for user management
 * Shared between Expressio and Pyrite
 */

/**
 * Create the users table schema
 * This is the common table used by UserManager for all services
 */
export function createUsersTable(db: Database): void {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            permissions TEXT NOT NULL DEFAULT '{}',
            avatar TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    `)
}

/**
 * Initialize database connection with common setup
 * @param dbPath Path to database file (defaults to ~/.{appName}.db)
 * @param appName Application name (e.g., 'expressio', 'pyrite')
 * @param logger Optional logger instance
 * @returns Initialized database instance
 */
interface Logger {
    info(message: string): void
    warn?(message: string): void
}

export function initDatabase(dbPath?: string, appName?: string, logger?: Logger): Database {
    const finalPath = dbPath || (appName ? path.join(homedir(), `.${appName}.db`) : path.join(homedir(), '.app.db'))

    if (logger) {
        logger.info(`[Database] Initializing SQLite database at ${finalPath}`)
    }

    // Clean up any leftover WAL/SHM files before opening (prevents corruption errors)
    const walPath = `${finalPath}-wal`
    const shmPath = `${finalPath}-shm`

    try {
        if (fs.pathExistsSync(walPath)) {
            fs.removeSync(walPath)
            if (logger) {
                logger.warn?.(`[Database] Removed leftover WAL file: ${walPath}`)
            }
        }
        if (fs.pathExistsSync(shmPath)) {
            fs.removeSync(shmPath)
            if (logger) {
                logger.warn?.(`[Database] Removed leftover SHM file: ${shmPath}`)
            }
        }
    } catch (cleanupError) {
        if (logger) {
            logger.warn?.(`[Database] Cleanup warning: ${cleanupError}`)
        }
    }

    // Create database (will create new file if it doesn't exist)
    const db = new Database(finalPath, {create: true})

    // Enable WAL mode for better concurrent access
    db.exec('PRAGMA journal_mode = WAL')
    db.exec('PRAGMA foreign_keys = ON')

    // Create common users table
    createUsersTable(db)

    if (logger) {
        logger.info('[Database] Common users table created successfully')
    }

    return db
}
