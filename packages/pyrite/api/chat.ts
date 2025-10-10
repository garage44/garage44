import fs from 'fs-extra'
import path from 'path'
import {runtime} from '../service.ts'
import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'

export function registerChatWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    const apiWs = wsManager.api

    // WebSocket API for real-time chat messages
    apiWs.post('/api/chat/send', async (context, request) => {
        const {groupId, message, user} = request.data

        // Broadcast message to all clients in the group
        wsManager.broadcast(`/chat/${groupId}`, {
            message,
            user,
            timestamp: Date.now(),
        })

        return {status: 'ok'}
    })
}

export default async function(router: any) {
    const emojiPath = path.join(runtime.service_dir, 'lib', 'emoji', 'data-ordered-emoji.json')
    const emoji = await fs.readFile(emojiPath, 'utf8')

    router.get('/api/chat/emoji', async (req: Request, params: Record<string, string>, session: any) => {
        return new Response(JSON.stringify(emoji), {
            headers: { 'Content-Type': 'application/json' }
        })
    })
}
