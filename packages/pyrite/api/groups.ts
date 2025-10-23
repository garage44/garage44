import {groupTemplate, loadGroup, loadGroups, pingGroups, saveGroup, syncGroup} from '../lib/group.ts'
import {syncUsers} from '../lib/sync.ts'
import {config} from '../lib/config.ts'
import fs from 'fs-extra'
import path from 'path'
import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'

export function registerGroupsWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    const apiWs = wsManager.api

    // WebSocket API for group state synchronization
    apiWs.post('/api/groups/:groupid/sync', async (context, request) => {
        const {groupid} = request.params
        const {state} = request.data

        // Broadcast group state changes to all clients
        wsManager.broadcast(`/group/${groupid}/state`, {
            state,
            timestamp: Date.now(),
        })

        return {status: 'ok'}
    })
}

export default function(router: any) {

    router.get('/api/groups', async (req: Request, params: Record<string, string>, session: any) => {
        const {groupNames, groupsData} = await loadGroups()
        // await pingGroups(groupNames) // Commented out - Galene doesn't have individual group endpoints
        return new Response(JSON.stringify(groupsData), {
            headers: {'Content-Type': 'application/json'},
        })
    })

    router.get('/api/groups/public', async (req: Request, params: Record<string, string>, session: any) => {
        const {groupNames, groupsData} = await loadGroups(true)
        console.log('GROUPS DATA', groupsData)
        // await pingGroups(groupNames) // Commented out - Galene doesn't have individual group endpoints
        return new Response(JSON.stringify(groupsData), {
            headers: {'Content-Type': 'application/json'},
        })
    })

    router.get('/api/groups/template', async (req: Request, params: Record<string, string>, session: any) => {
        return new Response(JSON.stringify(groupTemplate()), {
            headers: {'Content-Type': 'application/json'},
        })
    })

    router.get('/api/groups/:groupid', async (req: Request, params: Record<string, string>, session: any) => {
        const groupId = params.param0
        // Basic path traversal protection
        if (groupId.match(/\.\.\//g) !== null) {
            return new Response(JSON.stringify({error: 'invalid group id'}), {
                headers: {'Content-Type': 'application/json'},
                status: 400,
            })
        }

        const groupData = await loadGroup(groupId)
        if (!groupData) {
            return new Response(JSON.stringify(groupTemplate(groupId)), {
                headers: {'Content-Type': 'application/json'},
            })
        }

        return new Response(JSON.stringify(groupData), {
            headers: {'Content-Type': 'application/json'},
        })
    })

    router.post('/api/groups/:groupid', async (req: Request, params: Record<string, string>, session: any) => {
        const body = await req.json()
        const {data, groupId} = await saveGroup(params.param0, body)
        await syncGroup(groupId, data)
        await syncUsers()

        const group = await loadGroup(groupId)
        group._name = params.param0
        group._newName = groupId
        // await pingGroups([groupId]) // Commented out - Galene doesn't have individual group endpoints
        return new Response(JSON.stringify(group), {
            headers: {'Content-Type': 'application/json'},
        })
    })

    router.get('/api/groups/:groupid/delete', async (req: Request, params: Record<string, string>, session: any) => {
        const groupId = params.param0
        const groupFile = path.join(config.sfu.path, 'groups', `${groupId}.json`)
        await fs.remove(groupFile)
        const {groupNames} = await loadGroups()
        await syncUsers()
        // await pingGroups([groupId]) // Commented out - Galene doesn't have individual group endpoints
        return new Response(JSON.stringify(groupNames), {
            headers: {'Content-Type': 'application/json'},
        })
    })
}
