/**
 * WebSocket API for group state management
 * Provides real-time updates for group locks, recordings, and permissions
 * Uses REST-like API pattern over WebSocket (same as Expressio)
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'

export const registerGroupsWebSocket = (wsManager: WebSocketServerManager) => {
    const api = wsManager.api

    /**
     * Set group lock status
     * POST /api/groups/:groupId/lock
     */
    api.post('/api/groups/:groupId/lock', async (context, request) => {
        const {groupId} = request.params
        const {locked, reason} = request.data

        // Broadcast lock status to all clients
        wsManager.broadcast(`/groups/${groupId}/lock`, {
            locked,
            reason,
            timestamp: Date.now(),
        })

        return {success: true}
    })

    /**
     * Set recording status
     * POST /api/groups/:groupId/recording
     */
    api.post('/api/groups/:groupId/recording', async (context, request) => {
        const {groupId} = request.params
        const {recording, recordingId} = request.data

        // Broadcast recording status to all clients
        wsManager.broadcast(`/groups/${groupId}/recording`, {
            recording,
            recordingId,
            timestamp: Date.now(),
        })

        return {success: true}
    })

    /**
     * Update group configuration
     * POST /api/groups/:groupId/config
     */
    api.post('/api/groups/:groupId/config', async (context, request) => {
        const {groupId} = request.params
        const {config} = request.data

        // Broadcast config update to all clients
        wsManager.broadcast(`/groups/${groupId}/config`, {
            config,
            timestamp: Date.now(),
        })

        return {success: true}
    })

    /**
     * Notify group created or deleted
     * POST /api/groups/update
     */
    api.post('/api/groups/update', async (context, request) => {
        const {groupId, action, group} = request.data

        // Broadcast group update to all clients
        wsManager.broadcast('/groups/update', {
            action,
            group,
            groupId,
            timestamp: Date.now(),
        })

        return {success: true}
    })

    /**
     * Operator action (kick, mute, permissions)
     * POST /api/groups/:groupId/op-action
     */
    api.post('/api/groups/:groupId/op-action', async (context, request) => {
        const {groupId} = request.params
        const {action, targetUserId, actionData} = request.data

        // Broadcast operator action to all clients in group
        wsManager.broadcast(`/groups/${groupId}/op-action`, {
            action,
            actionData,
            targetUserId,
            timestamp: Date.now(),
        })

        return {success: true}
    })
}
