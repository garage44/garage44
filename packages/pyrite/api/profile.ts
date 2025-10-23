import {createAuthApi} from '@garage44/common/lib/auth-api'
import {authContext, noAuthContext, noPermissionContext} from '../lib/profile.ts'
import {authenticateUser, getUserByUsername} from '../lib/user.ts'

export default function(router: any) {
    // Create unified authentication API
    const authApi = createAuthApi({
        authenticateUser,
        contextFunctions: {
            adminContext: authContext,
            deniedContext: noAuthContext,
            userContext: noPermissionContext,
        },
        getUserByUsername,
    })

    // Register unified authentication endpoints
    router.get('/api/context', authApi.getContext)
    router.post('/api/login', authApi.login)
    router.get('/api/logout', authApi.logout)
}
