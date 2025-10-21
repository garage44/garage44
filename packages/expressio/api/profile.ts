import {adminContext, deniedContext, userContext} from '@garage44/common/lib/profile.ts'
import {logger} from '../service.ts'
import {authenticateUser} from '../lib/user.ts'

export default function apiProfile(router) {
    // HTTP API endpoints using familiar Express-like pattern
    router.get('/api/context', async (req, params, session) => {
        let context = null

        if (process.env.GARAGE44_NO_SECURITY) {
            logger.warn('session security is disabled (GARAGE44_NO_SECURITY)')
            context = adminContext()
            return new Response(JSON.stringify(context), {
                headers: {'Content-Type': 'application/json'},
            })
        }

        // Check session for user context
        if (session?.userid) {
            const {getUserByUsername} = await import('../lib/user.ts')
            const user = await getUserByUsername(session.userid)
            if (user) {
                if (user.permissions.admin) {
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
            headers: {'Content-Type': 'application/json'},
        })
    })

    router.post('/api/login', async (req, params, session) => {

        const body = await req.json()
        const username = body.username
        const password = body.password

        let context = deniedContext()
        const user = await authenticateUser(username, password)
        if (user) {
            // Set the user in session
            session.userid = user.username

            if (user.permissions.admin) {
                context = adminContext()
            } else {
                context = userContext()
            }
        }

        return new Response(JSON.stringify(context), {
            headers: {'Content-Type': 'application/json'},
        })
    })

    router.get('/api/logout', (req, params, session) => {
        // Clear the session
        if (session) {
            session.userid = null
        }

        const context = deniedContext()
        return new Response(JSON.stringify(context), {
            headers: {'Content-Type': 'application/json'},
        })
    })
}
