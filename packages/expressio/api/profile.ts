import {createAuthApi} from '@garage44/common/lib/auth-api'
import {adminContext, deniedContext, userContext} from '@garage44/common/lib/profile.ts'
import {authenticateUser, getUserByUsername} from '../lib/user.ts'

export default function apiProfile(router) {
    // Create unified authentication API
    const authApi = createAuthApi({
        authenticateUser,
        contextFunctions: {
            adminContext,
            deniedContext,
            userContext,
        },
        getUserByUsername,
    })

    // Register unified authentication endpoints
    router.get('/api/context', authApi.getContext)
    router.post('/api/login', authApi.login)
    router.get('/api/logout', authApi.logout)
}
