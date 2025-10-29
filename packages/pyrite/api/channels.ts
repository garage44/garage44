import {Router} from '../lib/middleware.ts'
import {ChannelManager} from '../lib/channel-manager.ts'
import {getDatabase} from '../lib/database.ts'
import {logger} from '../service.ts'

let channelManager: ChannelManager | null = null

export default async function apiChannels(router: Router) {
    // Initialize channel manager
    if (!channelManager) {
        channelManager = new ChannelManager(getDatabase())
    }

    /**
     * List all channels the user has access to
     * GET /api/channels
     */
    router.get('/api/channels', async (req, params, session) => {
        try {
            // Get user ID from session/context - placeholder for now
            const userId = 1

            const allChannels = await channelManager!.listChannels()
            const accessibleChannels = []

            for (const channel of allChannels) {
                if (await channelManager!.canAccessChannel(channel.id, userId)) {
                    accessibleChannels.push(channel)
                }
            }

            return new Response(JSON.stringify({
                success: true,
                channels: accessibleChannels
            }), {
                headers: { 'Content-Type': 'application/json' }
            })
        } catch (error) {
            logger.error('[Channels API] Error listing channels:', error)
            return new Response(JSON.stringify({
                success: false,
                error: error.message
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            })
        }
    })

    /**
     * Get a specific channel
     * GET /api/channels/:channelId
     */
    router.get('/api/channels/:channelId', async (req, params, session) => {
        try {
            const channelId = parseInt(params.param0, 10)

            if (isNaN(channelId)) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Invalid channel ID'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                })
            }

            // Get user ID from session/context - placeholder for now
            const userId = 1

            if (!channelManager!.canAccessChannel(channelId, userId)) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Access denied'
                }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                })
            }

            const channel = await channelManager!.getChannel(channelId)

            if (!channel) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Channel not found'
                }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                })
            }

            return new Response(JSON.stringify({
                success: true,
                channel
            }), {
                headers: { 'Content-Type': 'application/json' }
            })
        } catch (error) {
            logger.error('[Channels API] Error getting channel:', error)
            return new Response(JSON.stringify({
                success: false,
                error: error.message
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            })
        }
    })
}
