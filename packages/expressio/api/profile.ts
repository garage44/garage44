import {adminContext, deniedContext, userContext} from '@garage44/common/lib/profile.ts'
import {config} from '../lib/config.ts'
import {logger} from '../service.ts'

export default async function(router) {
    // HTTP API endpoints using familiar Express-like pattern
    router.get('/api/context', async (req) => {
        let context

        if (process.env.GARAGE44_NO_SECURITY) {
            logger.warn('session security is disabled (GARAGE44_NO_SECURITY)')
            context = adminContext()
            return new Response(JSON.stringify(context), {
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // For now, assume denied context since we don't have proper session handling
        // In a real implementation, you'd get the session from the request
        context = deniedContext()
        return new Response(JSON.stringify(context), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.post('/api/login', async (req) => {
        const users = config.users
        const body = await req.json()
        const username = body.username
        let context
        const user = users.find((i) => i.name === username)
        if (!user) {
            context = deniedContext()
        } else {
            const password = body.password
            if (password === user.password) {
                // For now, assume successful login since we don't have proper session handling
                if (user.admin) {
                    context = adminContext()
                } else {
                    context = userContext()
                }
            } else {
                context = deniedContext()
            }
        }
        return new Response(JSON.stringify(context), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.get('/api/logout', async (req) => {
        // For now, just return denied context since we don't have proper session handling
        const context = deniedContext()
        return new Response(JSON.stringify(context), {
            headers: { 'Content-Type': 'application/json' }
        })
    })
}
