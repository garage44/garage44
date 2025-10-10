/**
 * WebSocket API for user presence and group state
 * Provides real-time updates for connected users and group status
 * Uses REST-like API pattern over WebSocket (same as Expressio)
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'

interface PresenceState {
    groups: Map<string, Set<string>> // groupId -> Set of userIds
    users: Map<string, {
        id: string
        username: string
        groupId: string | null
        connected: Date
    }>
}

const state: PresenceState = {
    groups: new Map(),
    users: new Map(),
}

export const registerPresenceWebSocket = (wsManager: WebSocketServerManager) => {
    const api = wsManager.api

    /**
     * User joins a group
     * POST /api/presence/:groupId/join
     */
    api.post('/api/presence/:groupId/join', async (context, request) => {
        const {groupId} = request.params
        const {userId, username} = request.data

        // Add user to group
        if (!state.groups.has(groupId)) {
            state.groups.set(groupId, new Set())
        }
        state.groups.get(groupId)!.add(userId)

        // Update user state
        state.users.set(userId, {
            connected: new Date(),
            groupId,
            id: userId,
            username,
        })

        // Broadcast to all clients
        wsManager.broadcast(`/presence/${groupId}/join`, {
            groupId,
            timestamp: Date.now(),
            userId,
            username,
        })

        // Return current group members to joining user
        const members = Array.from(state.groups.get(groupId) || [])
            .map(id => state.users.get(id))
            .filter(Boolean)

        return {
            groupId,
            members,
        }
    })

    /**
     * User leaves a group
     * POST /api/presence/:groupId/leave
     */
    api.post('/api/presence/:groupId/leave', async (context, request) => {
        const {groupId} = request.params
        const {userId} = request.data

        // Remove user from group
        const group = state.groups.get(groupId)
        if (group) {
            group.delete(userId)
            if (group.size === 0) {
                state.groups.delete(groupId)
            }
        }

        // Update user state
        const user = state.users.get(userId)
        if (user) {
            user.groupId = null
        }

        // Broadcast to all clients
        wsManager.broadcast(`/presence/${groupId}/leave`, {
            groupId,
            timestamp: Date.now(),
            userId,
        })

        return {success: true}
    })

    /**
     * Get current presence for a group
     * GET /api/presence/:groupId/members
     */
    api.get('/api/presence/:groupId/members', async (context, request) => {
        const {groupId} = request.params

        const members = Array.from(state.groups.get(groupId) || [])
            .map(id => state.users.get(id))
            .filter(Boolean)

        return {
            groupId,
            members,
        }
    })

    /**
     * Update user status (availability, mic state, etc.)
     * POST /api/presence/:groupId/status
     */
    api.post('/api/presence/:groupId/status', async (context, request) => {
        const {groupId} = request.params
        const {userId, status} = request.data

        const user = state.users.get(userId)
        if (user) {
            Object.assign(user, status)

            // Broadcast status update
            wsManager.broadcast(`/presence/${groupId}/status`, {
                status,
                timestamp: Date.now(),
                userId,
            })
        }

        return {success: true}
    })
}
