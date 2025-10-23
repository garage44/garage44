// Unified authentication API endpoints
export function createAuthApi(config: {
    authenticateUser: (username: string, password: string) => Promise<unknown>
    contextFunctions: {
        adminContext: () => unknown
        deniedContext: () => unknown
        userContext: () => unknown
    }
    getUserByUsername: (username: string) => Promise<unknown>
}) {
    return {
        // GET /api/context - Get current authentication context
        async getContext(req: Request, params: Record<string, string>, session: unknown) {
            let context = null

            if (process.env.GARAGE44_NO_SECURITY) {
                context = config.contextFunctions.adminContext()
                return new Response(JSON.stringify(context), {
                    headers: {'Content-Type': 'application/json'},
                })
            }

            // Check session for user context
            if ((session as {userid?: string})?.userid) {
                const user = await config.getUserByUsername((session as {userid: string}).userid)
                if (user) {
                    if ((user as {permissions?: {admin?: boolean}}).permissions?.admin || (user as {admin?: boolean}).admin) {
                        context = config.contextFunctions.adminContext()
                    } else {
                        context = config.contextFunctions.userContext()
                    }
                } else {
                    context = config.contextFunctions.deniedContext()
                }
            } else {
                context = config.contextFunctions.deniedContext()
            }

            return new Response(JSON.stringify(context), {
                headers: {'Content-Type': 'application/json'},
            })
        },

        // POST /api/login - Authenticate user
        async login(req: Request, params: Record<string, string>, session: unknown) {
            const body = await req.json()
            const username = body.username
            const password = body.password

            let context = config.contextFunctions.deniedContext()
            const user = await config.authenticateUser(username, password)
            if (user) {
                // Set the user in session
                (session as {userid: string}).userid = (user as {username?: string}).username || (user as {name?: string}).name || username

                if ((user as {permissions?: {admin?: boolean}}).permissions?.admin || (user as {admin?: boolean}).admin) {
                    context = config.contextFunctions.adminContext()
                } else {
                    context = config.contextFunctions.userContext()
                }
            }

            return new Response(JSON.stringify(context), {
                headers: {'Content-Type': 'application/json'},
            })
        },

        // GET /api/logout - Clear session
        async logout(req: Request, params: Record<string, string>, session: unknown) {
            // Clear the session
            if (session) {
                (session as {userid: string | null}).userid = null
            }

            const context = config.contextFunctions.deniedContext()
            return new Response(JSON.stringify(context), {
                headers: {'Content-Type': 'application/json'},
            })
        },
    }
}
