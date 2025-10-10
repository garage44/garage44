import {authContext, noAuthContext, noPermissionContext} from '../lib/profile.ts'
import {loadUser, loadUsers} from '../lib/user.ts'
import {config} from '../lib/config.ts'

export default function(router: any) {

    router.get('/api/context', async (req: Request, params: Record<string, string>, session: any) => {
        let context

        // Check if security is disabled via environment variable
        if (process.env.PYRITE_NO_SECURITY) {
            context = await authContext()
            return new Response(JSON.stringify(context), {
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Check if the session has a user ID
        if (session.userid) {
            const user = await loadUser(session.userid)
            // If user is not found or not an admin, return noAuthContext
            if (!user || !user.admin) {
                context = noAuthContext()
            } else {
                // If user is an admin, return authContext
                context = await authContext()
            }
        } else {
            // If no user ID in session, return noAuthContext
            context = noAuthContext()
        }
        return new Response(JSON.stringify(context), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.post('/api/login', async (req: Request, params: Record<string, string>, session: any) => {
        const body = await req.json()
        const users = config.users
        const username = body.username
        const user = users.find((i) => i.name === username)
        let context

        if (!user) {
            context = noAuthContext()
            return new Response(JSON.stringify(context), {
                headers: { 'Content-Type': 'application/json' }
            })
        } else {
            const password = body.password

            if (password === user.password) {
                if (user.admin) {
                    session.userid = user.name
                    context = await authContext()
                } else {
                    context = noPermissionContext()
                }
            } else {
                context = noAuthContext()
            }
        }
        return new Response(JSON.stringify(context), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.get('/api/logout', async (req: Request, params: Record<string, string>, session: any) => {
        session.userid = null
        const context = noAuthContext()
        return new Response(JSON.stringify(context), {
            headers: { 'Content-Type': 'application/json' }
        })
    })
}
