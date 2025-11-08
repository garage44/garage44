import {Router} from '../lib/middleware.ts'
import {ChannelManager} from '../lib/channel-manager.ts'
import {getDatabase} from '../lib/database.ts'
import {userManager} from '@garage44/common/service'
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
            // Get user ID from session (session.userid contains username)
            let userId: string | null = null
            if (session?.userid) {
                const user = await userManager.getUserByUsername(session.userid)
                if (user) {
                    userId = user.id
                }
            }

            // If no authenticated user, return empty channels
            if (!userId) {
                return new Response(JSON.stringify({
                    channels: [],
                    success: true,
                }), {
                    headers: {'Content-Type': 'application/json'},
                })
            }

            const allChannels = await channelManager!.listChannels()
            const accessibleChannels = []

            for (const channel of allChannels) {
                if (channelManager!.canAccessChannel(channel.id, userId)) {
                    accessibleChannels.push(channel)
                }
            }

            return new Response(JSON.stringify({
                channels: accessibleChannels,
                success: true,
            }), {
                headers: {'Content-Type': 'application/json'},
            })
        } catch (error) {
            logger.error('[Channels API] Error listing channels:', error)
            return new Response(JSON.stringify({
                error: error.message,
                success: false,
            }), {
                headers: {'Content-Type': 'application/json'},
                status: 500,
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
                    error: 'Invalid channel ID',
                    success: false,
                }), {
                    headers: {'Content-Type': 'application/json'},
                    status: 400,
                })
            }

            // Get user ID from session (session.userid contains username)
            let userId: string | null = null
            if (session?.userid) {
                const user = await userManager.getUserByUsername(session.userid)
                if (user) {
                    userId = user.id
                }
            }

            if (!userId || !channelManager!.canAccessChannel(channelId, userId)) {
                return new Response(JSON.stringify({
                    error: 'Access denied',
                    success: false,
                }), {
                    headers: {'Content-Type': 'application/json'},
                    status: 403,
                })
            }

            const channel = await channelManager!.getChannel(channelId)

            if (!channel) {
                return new Response(JSON.stringify({
                    error: 'Channel not found',
                    success: false,
                }), {
                    headers: {'Content-Type': 'application/json'},
                    status: 404,
                })
            }

            return new Response(JSON.stringify({
                channel,
                success: true,
            }), {
                headers: {'Content-Type': 'application/json'},
            })
        } catch (error) {
            logger.error('[Channels API] Error getting channel:', error)
            return new Response(JSON.stringify({
                error: error.message,
                success: false,
            }), {
                headers: {'Content-Type': 'application/json'},
                status: 500,
            })
        }
    })
}
