/**
 * Label Definitions WebSocket API Routes
 */

import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'
import {
    deleteLabelDefinition,
    getLabelDefinition,
    getLabelDefinitions,
    upsertLabelDefinition,
} from '../lib/database.ts'
import {logger} from '../service.ts'
import {randomId} from '@garage44/common/lib/utils'

export function registerLabelsWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    // Get all label definitions
    wsManager.api.get('/api/labels', async(_ctx, _req) => {
        const labels = getLabelDefinitions()

        return {
            labels,
        }
    })

    // Get label definition by name
    wsManager.api.get('/api/labels/:name', async(_ctx, req) => {
        const name = req.params.name
        const label = getLabelDefinition(name)

        if (!label) {
            throw new Error('Label not found')
        }

        return {
            label,
        }
    })

    // Create or update label definition
    wsManager.api.post('/api/labels', async(_ctx, req) => {
        const {
            id,
            color,
            name,
        } = req.data as {
            color: string
            id?: string
            name: string
        }

        if (!name || !color) {
            throw new Error('Name and color are required')
        }

        const labelId = id || `label-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`
        upsertLabelDefinition(labelId, name, color)

        const label = getLabelDefinition(name)

        // Broadcast label update
        wsManager.broadcast('/labels', {
            label,
            type: 'label:updated',
        })

        logger.info(`[API] Created/updated label definition: ${name}`)

        return {
            label,
        }
    })

    // Update label definition
    wsManager.api.put('/api/labels/:id', async(_ctx, req) => {
        const labelId = req.params.id
        const {
            color,
            name,
        } = req.data as {
            color?: string
            name?: string
        }

        const existing = getLabelDefinitions().find((l) => l.id === labelId)
        if (!existing) {
            throw new Error('Label not found')
        }

        const updatedName = name || existing.name
        const updatedColor = color || existing.color

        upsertLabelDefinition(labelId, updatedName, updatedColor)

        const label = getLabelDefinition(updatedName)

        // Broadcast label update
        wsManager.broadcast('/labels', {
            label,
            type: 'label:updated',
        })

        logger.info(`[API] Updated label definition: ${labelId}`)

        return {
            label,
        }
    })

    // Delete label definition
    wsManager.api.delete('/api/labels/:id', async(_ctx, req) => {
        const labelId = req.params.id

        const existing = getLabelDefinitions().find((l) => l.id === labelId)
        if (!existing) {
            throw new Error('Label not found')
        }

        deleteLabelDefinition(labelId)

        // Broadcast label deletion
        wsManager.broadcast('/labels', {
            labelId,
            type: 'label:deleted',
        })

        logger.info(`[API] Deleted label definition: ${labelId}`)

        return {
            success: true,
        }
    })
}
