import {UserManager} from '@garage44/common/lib/user-manager'
import {logger} from '../service.ts'
import {syncUsers} from '../lib/sync.ts'

// Create UserManager for Pyrite
const userManager = new UserManager({
    appName: 'pyrite',
    configPath: '~/.pyriterc',
    useBcrypt: false,
})

// Helper functions using UserManager
const loadUser = (userId: string) => userManager.getUser(userId)
const loadUsers = () => userManager.listUsers()
const saveUser = (userId: string, data: any) => userManager.updateUser(userId, data)
const saveUsers = async (users) => {
    for (const user of users) {
        await userManager.updateUser(user.id || user.username || user.name, user)
    }
}

// User template function
function userTemplate() {
    return {
        id: '',
        username: '',
        password: {key: '', type: 'plaintext'},
        permissions: {
            admin: false,
            groups: {}
        },
        profile: {
            displayName: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
}
import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'

export function registerUsersWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    const apiWs = wsManager.api

    // WebSocket API for user presence updates
    apiWs.post('/api/users/presence', async (context, request) => {
        const {userid, status} = request.data

        // Broadcast user presence changes
        wsManager.broadcast('/users/presence', {
            userid,
            status,
            timestamp: Date.now(),
        })

        return {status: 'ok'}
    })
}

export default function(router: any) {

    router.get('/api/users', async (req: Request, params: Record<string, string>, session: any) => {
        const users = await loadUsers()
        return new Response(JSON.stringify(users), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.get('/api/users/template', async (req: Request, params: Record<string, string>, session: any) => {
        return new Response(JSON.stringify(userTemplate()), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.get('/api/users/:userid', async (req: Request, params: Record<string, string>, session: any) => {
        const userId = params.param0
        // Basic path traversal protection
        if (userId.match(/\.\.\//g) !== null) {
            return new Response(JSON.stringify({error: 'invalid user id'}), {
                headers: { 'Content-Type': 'application/json' },
                status: 400
            })
        }

        const users = await loadUsers()
        const user = users.find((i) => i.id === userId)
        // User doesn't exist yet
        if (!user) {
            return new Response(JSON.stringify({error: 'user not found'}), {
                headers: { 'Content-Type': 'application/json' },
                status: 404
            })
        }
        return new Response(JSON.stringify(user), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.post('/api/users/:userid', async (req: Request, params: Record<string, string>, session: any) => {
        const userId = params.param0
        const userData = await req.json()
        await saveUser(userId, userData)
        await syncUsers()
        const user = await loadUser(userId)
        return new Response(JSON.stringify(user), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.get('/api/users/:userid/delete', async (req: Request, params: Record<string, string>, session: any) => {
        const userId = params.param0
        const users = await loadUsers()
        for (let [index, user] of users.entries()) {
            if (user.id === userId) {
                users.splice(index, 1)
            }
        }

        await saveUsers(users)
        await syncUsers()

        return new Response(JSON.stringify({status: 'ok'}), {
            headers: { 'Content-Type': 'application/json' }
        })
    })
}
