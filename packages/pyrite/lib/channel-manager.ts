import {Database} from 'bun:sqlite'
import {logger} from '../service.ts'
import type {User} from './database.ts'

/**
 * Channel Manager for Pyrite
 * Handles CRUD operations for channels and channel membership
 */

export interface Channel {
    id: number
    name: string
    description: string
    galene_group: string
    created_at: number
    member_count?: number
    unread_count?: number
}

export interface ChannelMember {
    channel_id: number
    user_id: string
    role: 'member' | 'admin'
    joined_at: number
    username: string
    avatar: string
}

export class ChannelManager {
    private db: Database

    constructor(database: Database) {
        this.db = database
    }

    /**
     * Create a new channel
     */
    async createChannel(name: string, description: string, galeneGroup: string, creatorId: string): Promise<Channel> {
        const now = Date.now()

        const insertChannel = this.db.prepare(`
            INSERT INTO channels (name, description, galene_group, created_at)
            VALUES (?, ?, ?, ?)
        `)

        const result = insertChannel.run(name, description, galeneGroup, now)
        const channelId = result.lastInsertRowid as number

        // Add creator as admin
        await this.addMember(channelId, creatorId, 'admin')

        logger.info(`[ChannelManager] Created channel "${name}" (id: ${channelId})`)

        return this.getChannel(channelId)!
    }

    /**
     * Get a channel by ID
     */
    getChannel(id: number): Channel | null {
        const stmt = this.db.prepare(`
            SELECT c.*, COUNT(cm.user_id) as member_count
            FROM channels c
            LEFT JOIN channel_members cm ON c.id = cm.channel_id
            WHERE c.id = ?
            GROUP BY c.id
        `)

        return stmt.get(id) as Channel | null
    }

    /**
     * Get a channel by name
     */
    getChannelByName(name: string): Channel | null {
        const stmt = this.db.prepare(`
            SELECT c.*, COUNT(cm.user_id) as member_count
            FROM channels c
            LEFT JOIN channel_members cm ON c.id = cm.channel_id
            WHERE c.name = ?
            GROUP BY c.id
        `)

        return stmt.get(name) as Channel | null
    }

    /**
     * List all channels
     */
    async listChannels(): Promise<Channel[]> {
        const stmt = this.db.prepare(`
            SELECT c.*, COUNT(cm.user_id) as member_count
            FROM channels c
            LEFT JOIN channel_members cm ON c.id = cm.channel_id
            GROUP BY c.id
            ORDER BY c.created_at ASC
        `)

        return stmt.all() as Channel[]
    }

    /**
     * List channels that a user is a member of
     */
    listUserChannels(userId: string): Channel[] {
        const stmt = this.db.prepare(`
            SELECT c.*, COUNT(cm.user_id) as member_count
            FROM channels c
            INNER JOIN channel_members cm ON c.id = cm.channel_id
            WHERE cm.user_id = ?
            GROUP BY c.id
            ORDER BY c.created_at ASC
        `)

        return stmt.all(userId) as Channel[]
    }

    /**
     * Update a channel
     */
    async updateChannel(id: number, updates: Partial<Pick<Channel, 'name' | 'description' | 'galene_group'>>): Promise<Channel | null> {
        const channel = this.getChannel(id)
        if (!channel) return null

        const fields = []
        const values = []

        if (updates.name !== undefined) {
            fields.push('name = ?')
            values.push(updates.name)
        }
        if (updates.description !== undefined) {
            fields.push('description = ?')
            values.push(updates.description)
        }
        if (updates.galene_group !== undefined) {
            fields.push('galene_group = ?')
            values.push(updates.galene_group)
        }

        if (fields.length === 0) return channel

        const stmt = this.db.prepare(`
            UPDATE channels
            SET ${fields.join(', ')}
            WHERE id = ?
        `)

        stmt.run(...values, id)

        logger.info(`[ChannelManager] Updated channel ${id}`)
        return this.getChannel(id)
    }

    /**
     * Delete a channel
     */
    async deleteChannel(id: number): Promise<boolean> {
        const channel = this.getChannel(id)
        if (!channel) return false

        // Delete channel (cascade will handle members and messages)
        const stmt = this.db.prepare('DELETE FROM channels WHERE id = ?')
        stmt.run(id)

        logger.info(`[ChannelManager] Deleted channel "${channel.name}" (id: ${id})`)
        return true
    }

    /**
     * Add a user to a channel
     */
    async addMember(channelId: number, userId: string, role: 'member' | 'admin' = 'member'): Promise<boolean> {
        const now = Date.now()

        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO channel_members (channel_id, user_id, role, joined_at)
            VALUES (?, ?, ?, ?)
        `)

        stmt.run(channelId, userId, role, now)

        logger.info(`[ChannelManager] Added user ${userId} to channel ${channelId} as ${role}`)
        return true
    }

    /**
     * Remove a user from a channel
     */
    async removeMember(channelId: number, userId: string): Promise<boolean> {
        const stmt = this.db.prepare(`
            DELETE FROM channel_members
            WHERE channel_id = ? AND user_id = ?
        `)

        const result = stmt.run(channelId, userId)

        if (result.changes > 0) {
            logger.info(`[ChannelManager] Removed user ${userId} from channel ${channelId}`)
            return true
        }

        return false
    }

    /**
     * Get channel members
     */
    getChannelMembers(channelId: number): ChannelMember[] {
        const stmt = this.db.prepare(`
            SELECT cm.*, u.username, u.avatar
            FROM channel_members cm
            INNER JOIN users u ON cm.user_id = u.id
            WHERE cm.channel_id = ?
            ORDER BY cm.joined_at ASC
        `)

        return stmt.all(channelId) as ChannelMember[]
    }

    /**
     * Check if user is member of channel
     */
    isMember(channelId: number, userId: string): boolean {
        const stmt = this.db.prepare(`
            SELECT 1 FROM channel_members
            WHERE channel_id = ? AND user_id = ?
        `)

        return !!stmt.get(channelId, userId)
    }

    /**
     * Get user's role in channel
     */
    getUserRole(channelId: number, userId: string): 'member' | 'admin' | null {
        const stmt = this.db.prepare(`
            SELECT role FROM channel_members
            WHERE channel_id = ? AND user_id = ?
        `)

        const result = stmt.get(channelId, userId) as {role: string} | null
        return result?.role as 'member' | 'admin' | null
    }

    /**
     * Check if user can access channel (is member)
     */
    canAccessChannel(channelId: number, userId: string): boolean {
        return this.isMember(channelId, userId)
    }

    /**
     * Get channels that need Galene group sync
     */
    async getChannelsForGaleneSync(): Promise<Channel[]> {
        return await this.listChannels()
    }
}
