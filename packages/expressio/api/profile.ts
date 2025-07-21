import {adminContext, deniedContext, userContext} from '@garage44/common/lib/profile.ts'
import {config} from '../lib/config.ts'
import {logger} from '../service.ts'

export default function apiProfile(router:any) {
    // HTTP API endpoints using familiar Express-like pattern
    router.get('/api/context', (req, params, session) => {
        let context = null

        if (process.env.GARAGE44_NO_SECURITY) {
            logger.warn('session security is disabled (GARAGE44_NO_SECURITY)')
            context = adminContext()
            return new Response(JSON.stringify(context), {
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Check session for user context
        if (session?.userid) {
            const user = config.users.find((user) => user.name === session.userid)
            if (user) {
                if (user.admin) {
                    context = adminContext()
                } else {
                    context = userContext()
                }
            } else {
                context = deniedContext()
            }
        } else {
            context = deniedContext()
        }

        return new Response(JSON.stringify(context), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.post('/api/login', async (req, params, session) => {
        const users = config.users
        const body = await req.json()
        const username = body.username
        let context = deniedContext()
        const user = users.find((user) => user.name === username)
        if (user) {
            const password = body.password
            if (password === user.password) {
                // Set the user in session
                session.userid = username

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

    router.get('/api/logout', (req, params, session) => {
        // Clear the session
        if (session) {
            session.userid = null
        }

        const context = deniedContext()
        return new Response(JSON.stringify(context), {
            headers: { 'Content-Type': 'application/json' }
        })
    })
}
