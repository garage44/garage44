/**
 * WebSocket API for channel management
 * Provides CRUD operations for channels and channel membership
 * Uses REST-like API pattern over WebSocket (same as Expressio)
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {userManager} from '@garage44/common/service'
import {ChannelManager} from '../lib/channel-manager.ts'
import {getDatabase} from '../lib/database.ts'
import {logger} from '../service.ts'

let channelManager: ChannelManager | null = null

/**
 * Helper function to get user ID from WebSocket context
 */
async function getUserIdFromContext(context: {session?: {userid?: string}}): Promise<string | null> {
    if (!context.session?.userid) {
        return null
    }
    const user = await userManager.getUserByUsername(context.session.userid)
    return user?.id || null
}

export const registerChannelsWebSocket = (wsManager: WebSocketServerManager) => {
    const api = wsManager.api

    // Initialize channel manager
    if (!channelManager) {
        channelManager = new ChannelManager(getDatabase())
    }

    /**
     * List channels that the user has access to
     * GET /api/channels
     */
    api.get('/channels', async (context, _request) => {
        try {
            // Get user ID from context (context.session.userid contains username)
            let userId: string | null = null
            logger.debug(`[Channels API] Getting channels, session.userid: ${context.session?.userid}`)

            if (context.session?.userid) {
                const user = await userManager.getUserByUsername(context.session.userid)
                if (user) {
                    userId = user.id
                    logger.debug(`[Channels API] Found user: ${user.username}, ID: ${userId}`)
                } else {
                    logger.warn(`[Channels API] User not found for username: ${context.session.userid}`)
                }
            } else {
                logger.warn('[Channels API] No session.userid found in context')
            }

            // If no authenticated user, return empty channels
            if (!userId) {
                logger.warn('[Channels API] No authenticated user, returning empty channels')
                return {
                    channels: [],
                    success: true,
                }
            }

            const allChannels = await channelManager!.listChannels()
            logger.debug(`[Channels API] Found ${allChannels.length} total channels`)
            const accessibleChannels = []

            for (const channel of allChannels) {
                const canAccess = channelManager!.canAccessChannel(channel.id, userId)
                logger.debug(`[Channels API] Channel ${channel.id} (${channel.name}): canAccess=${canAccess}`)
                if (canAccess) {
                    accessibleChannels.push(channel)
                }
            }

            logger.info(`[Channels API] Returning ${accessibleChannels.length} accessible channels for user ${userId}`)
            return {
                channels: accessibleChannels,
                success: true,
            }
        } catch (error) {
            logger.error('[Channels API] Error listing channels:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })

    /**
     * Create a new channel
     * POST /api/channels
     */
    api.post('/channels', async (context, request) => {
        try {
            const {description, galeneGroup, name} = request.data

            if (!name || !galeneGroup) {
                return {
                    error: 'Name and galeneGroup are required',
                    success: false,
                }
            }

            // Get user ID from context (context.session.userid contains username)
            let creatorId: string | null = null
            if (context.session?.userid) {
                const user = await userManager.getUserByUsername(context.session.userid)
                if (user) {
                    creatorId = user.id
                }
            }

            if (!creatorId) {
                return {
                    error: 'Authentication required',
                    success: false,
                }
            }

            const channel = await channelManager!.createChannel(name, description || '', galeneGroup, creatorId)

            // Broadcast channel creation to all users
            wsManager.broadcast('/channels/created', {
                channel,
                timestamp: Date.now(),
            })

            return {
                channel,
                success: true,
            }
        } catch (error) {
            logger.error('[Channels API] Error creating channel:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })

    /**
     * Get a specific channel
     * GET /api/channels/:channelId
     */
    api.get('/channels/:channelId', async (context, request) => {
        try {
            const {channelId} = request.params
            const channelIdNum = parseInt(channelId, 10)

            if (isNaN(channelIdNum)) {
                return {
                    error: 'Invalid channel ID',
                    success: false,
                }
            }

            // Get user ID from context
            const userId = await getUserIdFromContext(context)

            if (!userId) {
                return {
                    error: 'Authentication required',
                    success: false,
                }
            }

            if (!channelManager!.canAccessChannel(channelIdNum, userId)) {
                return {
                    error: 'Access denied',
                    success: false,
                }
            }

            const channel = channelManager!.getChannel(channelIdNum)

            if (!channel) {
                return {
                    error: 'Channel not found',
                    success: false,
                }
            }

            return {
                channel,
                success: true,
            }
        } catch (error) {
            logger.error('[Channels API] Error getting channel:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })

    /**
     * Update a channel
     * PUT /api/channels/:channelId
     */
    api.put('/channels/:channelId', async (context, request) => {
        try {
            const {channelId} = request.params
            const channelIdNum = parseInt(channelId, 10)
            const updates = request.data

            if (isNaN(channelIdNum)) {
                return {
                    error: 'Invalid channel ID',
                    success: false,
                }
            }

            // Get user ID from context
            const userId = await getUserIdFromContext(context)

            if (!userId || !channelManager!.canAccessChannel(channelIdNum, userId)) {
                return {
                    error: 'Access denied',
                    success: false,
                }
            }

            const channel = await channelManager!.updateChannel(channelIdNum, updates)

            if (!channel) {
                return {
                    error: 'Channel not found',
                    success: false,
                }
            }

            // Broadcast channel update to all users
            wsManager.broadcast(`/channels/${channelId}/updated`, {
                channel,
                timestamp: Date.now(),
            })

            return {
                channel,
                success: true,
            }
        } catch (error) {
            logger.error('[Channels API] Error updating channel:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })

    /**
     * Delete a channel
     * DELETE /api/channels/:channelId
     */
    api.delete('/channels/:channelId', async (context, request) => {
        try {
            const {channelId} = request.params
            const channelIdNum = parseInt(channelId, 10)

            if (isNaN(channelIdNum)) {
                return {
                    error: 'Invalid channel ID',
                    success: false,
                }
            }

            // Get user ID from context
            const userId = await getUserIdFromContext(context)

            if (!userId || !channelManager!.canAccessChannel(channelIdNum, userId)) {
                return {
                    error: 'Access denied',
                    success: false,
                }
            }

            const success = await channelManager!.deleteChannel(channelIdNum)

            if (!success) {
                return {
                    error: 'Channel not found',
                    success: false,
                }
            }

            // Broadcast channel deletion to all users
            wsManager.broadcast(`/channels/${channelId}/deleted`, {
                channelId: channelIdNum,
                timestamp: Date.now(),
            })

            return {
                success: true,
            }
        } catch (error) {
            logger.error('[Channels API] Error deleting channel:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })

    /**
     * Add a user to a channel
     * POST /api/channels/:channelId/members
     */
    api.post('/channels/:channelId/members', async (context, request) => {
        try {
            const {channelId} = request.params
            const channelIdNum = parseInt(channelId, 10)
            const {role = 'member', userId} = request.data

            if (isNaN(channelIdNum)) {
                return {
                    error: 'Invalid channel ID',
                    success: false,
                }
            }

            if (!userId) {
                return {
                    error: 'User ID is required',
                    success: false,
                }
            }

            // Get current user ID from session/context and check admin permissions - placeholder for now
            const currentUserId = 1

            if (!channelManager!.canAccessChannel(channelIdNum, currentUserId)) {
                return {
                    error: 'Access denied',
                    success: false,
                }
            }

            const success = await channelManager!.addMember(channelIdNum, userId, role)

            if (!success) {
                return {
                    error: 'Failed to add member',
                    success: false,
                }
            }

            // Broadcast membership change to all users
            wsManager.broadcast(`/channels/${channelId}/members`, {
                action: 'added',
                channelId: channelIdNum,
                role,
                timestamp: Date.now(),
                userId,
            })

            return {
                success: true,
            }
        } catch (error) {
            logger.error('[Channels API] Error adding member:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })

    /**
     * Remove a user from a channel
     * DELETE /api/channels/:channelId/members/:userId
     */
    api.delete('/channels/:channelId/members/:userId', async (context, request) => {
        try {
            const {channelId, userId} = request.params
            const channelIdNum = parseInt(channelId, 10)
            const userIdNum = parseInt(userId, 10)

            if (isNaN(channelIdNum) || isNaN(userIdNum)) {
                return {
                    error: 'Invalid channel ID or user ID',
                    success: false,
                }
            }

            // Get current user ID from session/context and check admin permissions - placeholder for now
            const currentUserId = 1

            if (!channelManager!.canAccessChannel(channelIdNum, currentUserId)) {
                return {
                    error: 'Access denied',
                    success: false,
                }
            }

            const success = await channelManager!.removeMember(channelIdNum, userIdNum)

            if (!success) {
                return {
                    error: 'Failed to remove member',
                    success: false,
                }
            }

            // Broadcast membership change to all users
            wsManager.broadcast(`/channels/${channelId}/members`, {
                action: 'removed',
                channelId: channelIdNum,
                timestamp: Date.now(),
                userId: userIdNum,
            })

            return {
                success: true,
            }
        } catch (error) {
            logger.error('[Channels API] Error removing member:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })

    /**
     * Get channel members
     * GET /api/channels/:channelSlug/members
     * Accepts channel slug (matches Galene group name 1:1)
     */
    api.get('/channels/:channelSlug/members', async (context, request) => {
        try {
            const {channelSlug} = request.params

            if (!channelSlug || typeof channelSlug !== 'string') {
                return {
                    error: 'Invalid channel slug',
                    success: false,
                }
            }

            // Look up channel by slug
            const channel = channelManager!.getChannelBySlug(channelSlug)
            if (!channel) {
                return {
                    error: 'Channel not found',
                    success: false,
                }
            }

            // Get user ID from context
            const userId = await getUserIdFromContext(context)

            if (!userId) {
                return {
                    error: 'Authentication required',
                    success: false,
                }
            }

            if (!channelManager!.canAccessChannel(channel.id, userId)) {
                return {
                    error: 'Access denied',
                    success: false,
                }
            }

            const members = channelManager!.getChannelMembers(channel.id)

            return {
                members,
                success: true,
            }
        } catch (error) {
            logger.error('[Channels API] Error getting members:', error)
            return {
                error: error.message,
                success: false,
            }
        }
    })
}
