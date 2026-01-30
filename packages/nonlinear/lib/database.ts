import {Database} from 'bun:sqlite'
import {initDatabase as initCommonDatabase} from '@garage44/common/lib/database'
import {logger} from '../service.ts'
import path from 'node:path'
import {homedir} from 'node:os'

/**
 * SQLite Database for Nonlinear
 * Manages Nonlinear-specific tables: repositories, tickets, comments, agents, ci_runs
 * Users table is managed by common database initialization
 */

let db: Database | null = null

export interface Repository {
    config: string
    // JSON string
    created_at: number
    id: string
    name: string
    path: string
    platform: 'github' | 'gitlab' | 'local'
    remote_url: string | null
    updated_at: number
}

export interface Ticket {
    assignee_id: string | null
    assignee_type: 'agent' | 'human' | null
    branch_name: string | null
    created_at: number
    description: string | null
    id: string
    merge_request_id: string | null
    priority: number | null
    repository_id: string
    status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'closed'
    title: string
    updated_at: number
    // Populated via JOINs for API responses
    labels?: string[]
    assignees?: Array<{assignee_type: 'agent' | 'human', assignee_id: string}>
}

export interface TicketLabel {
    ticket_id: string
    label: string
}

export interface TicketAssignee {
    ticket_id: string
    assignee_type: 'agent' | 'human'
    assignee_id: string
}

export interface Comment {
    author_id: string
    author_type: 'agent' | 'human'
    content: string
    created_at: number
    id: string
    mentions: string | null
    // JSON array string
    ticket_id: string
}

export interface Agent {
    avatar: string | null
    config: string
    // JSON string
    created_at: number
    display_name: string | null
    enabled: number
    // SQLite boolean (0 or 1)
    id: string
    name: string
    status: 'idle' | 'working' | 'error' | 'offline'
    type: 'prioritizer' | 'developer' | 'reviewer'
}

export interface CIRun {
    completed_at: number | null
    fixes_applied: string | null
    // JSON array string
    id: string
    output: string | null
    started_at: number
    status: 'running' | 'success' | 'failed' | 'fixed'
    ticket_id: string
}

/**
 * Initialize the database connection and create tables if needed
 * Uses common database initialization for users table
 */
export function initDatabase(dbPath?: string): Database {
    if (db) {
        return db
    }

    // Check for environment variable first (for PR deployments and isolated instances)
    const envDbPath = process.env.DB_PATH
    const finalPath = dbPath || envDbPath || path.join(homedir(), '.nonlinear.db')

    // Initialize common database (creates users table)
    db = initCommonDatabase(finalPath, 'nonlinear', logger)

    // Create Nonlinear-specific tables
    createNonlinearTables()

    return db
}

/**
 * Create Nonlinear-specific database tables
 * Users table is created by common database initialization
 */
function createNonlinearTables() {
    if (!db) throw new Error('Database not initialized')

    // Repositories table
    db.exec(`
        CREATE TABLE IF NOT EXISTS repositories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            path TEXT NOT NULL,
            platform TEXT NOT NULL,
            remote_url TEXT,
            config TEXT NOT NULL DEFAULT '{}',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    `)

    // Tickets table
    db.exec(`
        CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            repository_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL,
            priority INTEGER,
            assignee_type TEXT,
            assignee_id TEXT,
            branch_name TEXT,
            merge_request_id TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
        )
    `)

    // Create index on status for faster queries
    db.exec('CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)')
    db.exec('CREATE INDEX IF NOT EXISTS idx_tickets_repository_id ON tickets(repository_id)')

    // Comments table
    db.exec(`
        CREATE TABLE IF NOT EXISTS comments (
            id TEXT PRIMARY KEY,
            ticket_id TEXT NOT NULL,
            author_type TEXT NOT NULL,
            author_id TEXT NOT NULL,
            content TEXT NOT NULL,
            mentions TEXT,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
        )
    `)

    // Create index on ticket_id for faster comment queries
    db.exec('CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id)')

    // Agents table
    db.exec(`
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            config TEXT NOT NULL DEFAULT '{}',
            enabled INTEGER NOT NULL DEFAULT 1,
            avatar TEXT,
            display_name TEXT,
            status TEXT NOT NULL DEFAULT 'idle',
            created_at INTEGER NOT NULL
        )
    `)

    // Migrate existing agents table if needed (add new columns)
    try {
        db.exec(`
            ALTER TABLE agents ADD COLUMN avatar TEXT
        `)
    } catch {
        // Column already exists, ignore
    }
    try {
        db.exec(`
            ALTER TABLE agents ADD COLUMN display_name TEXT
        `)
    } catch {
        // Column already exists, ignore
    }
    try {
        db.exec(`
            ALTER TABLE agents ADD COLUMN status TEXT NOT NULL DEFAULT 'idle'
        `)
    } catch {
        // Column already exists, ignore
    }

    // CI runs table
    db.exec(`
        CREATE TABLE IF NOT EXISTS ci_runs (
            id TEXT PRIMARY KEY,
            ticket_id TEXT NOT NULL,
            status TEXT NOT NULL,
            output TEXT,
            fixes_applied TEXT,
            started_at INTEGER NOT NULL,
            completed_at INTEGER,
            FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
        )
    `)

    // Create index on ticket_id for faster CI run queries
    db.exec('CREATE INDEX IF NOT EXISTS idx_ci_runs_ticket_id ON ci_runs(ticket_id)')

    // Ticket labels junction table
    db.exec(`
        CREATE TABLE IF NOT EXISTS ticket_labels (
            ticket_id TEXT NOT NULL,
            label TEXT NOT NULL,
            PRIMARY KEY (ticket_id, label),
            FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
        )
    `)

    // Create indexes on ticket_labels
    db.exec('CREATE INDEX IF NOT EXISTS idx_ticket_labels_ticket_id ON ticket_labels(ticket_id)')
    db.exec('CREATE INDEX IF NOT EXISTS idx_ticket_labels_label ON ticket_labels(label)')

    // Ticket assignees junction table
    db.exec(`
        CREATE TABLE IF NOT EXISTS ticket_assignees (
            ticket_id TEXT NOT NULL,
            assignee_type TEXT NOT NULL,
            assignee_id TEXT NOT NULL,
            PRIMARY KEY (ticket_id, assignee_type, assignee_id),
            FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
        )
    `)

    // Create indexes on ticket_assignees
    db.exec('CREATE INDEX IF NOT EXISTS idx_ticket_assignees_ticket_id ON ticket_assignees(ticket_id)')
    db.exec('CREATE INDEX IF NOT EXISTS idx_ticket_assignees_assignee ON ticket_assignees(assignee_type, assignee_id)')

    // Migrate existing assignee data from tickets table to ticket_assignees
    migrateAssigneeData()

    logger.info('[Database] Nonlinear tables initialized')
}

/**
 * Migrate existing assignee data from tickets table to ticket_assignees junction table
 * This maintains backward compatibility while transitioning to multiple assignees
 */
function migrateAssigneeData() {
    if (!db) throw new Error('Database not initialized')

    try {
        // Get all tickets with assignees
        const ticketsWithAssignees = db.prepare(`
            SELECT id, assignee_type, assignee_id
            FROM tickets
            WHERE assignee_type IS NOT NULL AND assignee_id IS NOT NULL
        `).all() as Array<{
            id: string
            assignee_type: string
            assignee_id: string
        }>

        const insertStmt = db.prepare(`
            INSERT OR IGNORE INTO ticket_assignees (ticket_id, assignee_type, assignee_id)
            VALUES (?, ?, ?)
        `)

        let migratedCount = 0
        for (const ticket of ticketsWithAssignees) {
            try {
                insertStmt.run(ticket.id, ticket.assignee_type, ticket.assignee_id)
                migratedCount++
            } catch {
                // Already exists, skip
            }
        }

        if (migratedCount > 0) {
            logger.info(`[Database] Migrated ${migratedCount} existing assignees to ticket_assignees table`)
        }
    } catch (error) {
        logger.warn(`[Database] Error migrating assignee data: ${error}`)
        // Don't throw - migration failure shouldn't block initialization
    }
}

/**
 * Get all labels for a ticket
 */
export function getTicketLabels(ticketId: string): string[] {
    if (!db) throw new Error('Database not initialized')
    const labels = db.prepare(`
        SELECT label FROM ticket_labels WHERE ticket_id = ?
    `).all(ticketId) as Array<{label: string}>
    return labels.map(l => l.label)
}

/**
 * Add a label to a ticket
 */
export function addTicketLabel(ticketId: string, label: string): void {
    if (!db) throw new Error('Database not initialized')
    try {
        db.prepare(`
            INSERT INTO ticket_labels (ticket_id, label)
            VALUES (?, ?)
        `).run(ticketId, label)
    } catch (error) {
        // Label already exists, ignore
        if (!String(error).includes('UNIQUE constraint')) {
            throw error
        }
    }
}

/**
 * Remove a label from a ticket
 */
export function removeTicketLabel(ticketId: string, label: string): void {
    if (!db) throw new Error('Database not initialized')
    db.prepare(`
        DELETE FROM ticket_labels
        WHERE ticket_id = ? AND label = ?
    `).run(ticketId, label)
}

/**
 * Check if a ticket has a specific label
 */
export function hasTicketLabel(ticketId: string, label: string): boolean {
    if (!db) throw new Error('Database not initialized')
    const result = db.prepare(`
        SELECT 1 FROM ticket_labels
        WHERE ticket_id = ? AND label = ?
        LIMIT 1
    `).get(ticketId, label) as {1?: number} | undefined
    return !!result
}

/**
 * Get all assignees for a ticket
 */
export function getTicketAssignees(ticketId: string): Array<{assignee_type: 'agent' | 'human', assignee_id: string}> {
    if (!db) throw new Error('Database not initialized')
    const assignees = db.prepare(`
        SELECT assignee_type, assignee_id
        FROM ticket_assignees
        WHERE ticket_id = ?
    `).all(ticketId) as Array<{assignee_type: string, assignee_id: string}>
    return assignees.map(a => ({
        assignee_type: a.assignee_type as 'agent' | 'human',
        assignee_id: a.assignee_id,
    }))
}

/**
 * Add an assignee to a ticket
 */
export function addTicketAssignee(ticketId: string, assignee_type: 'agent' | 'human', assignee_id: string): void {
    if (!db) throw new Error('Database not initialized')
    try {
        db.prepare(`
            INSERT INTO ticket_assignees (ticket_id, assignee_type, assignee_id)
            VALUES (?, ?, ?)
        `).run(ticketId, assignee_type, assignee_id)
    } catch (error) {
        // Assignee already exists, ignore
        if (!String(error).includes('UNIQUE constraint')) {
            throw error
        }
    }
}

/**
 * Remove an assignee from a ticket
 */
export function removeTicketAssignee(ticketId: string, assignee_type: 'agent' | 'human', assignee_id: string): void {
    if (!db) throw new Error('Database not initialized')
    db.prepare(`
        DELETE FROM ticket_assignees
        WHERE ticket_id = ? AND assignee_type = ? AND assignee_id = ?
    `).run(ticketId, assignee_type, assignee_id)
}

/**
 * Check if a ticket has a specific assignee
 */
export function hasTicketAssignee(ticketId: string, assignee_type: 'agent' | 'human', assignee_id: string): boolean {
    if (!db) throw new Error('Database not initialized')
    const result = db.prepare(`
        SELECT 1 FROM ticket_assignees
        WHERE ticket_id = ? AND assignee_type = ? AND assignee_id = ?
        LIMIT 1
    `).get(ticketId, assignee_type, assignee_id) as {1?: number} | undefined
    return !!result
}

export {
    db,
}
