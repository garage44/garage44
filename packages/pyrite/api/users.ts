import {userManager} from '@garage44/common/service'
import {createAvatarRoutes, getAvatarStoragePath} from '@garage44/common/lib/avatar-routes'
import {logger, runtime} from '../service.ts'
import {syncUsers} from '../lib/sync.ts'
import path from 'node:path'
import {homedir} from 'node:os'
import fs from 'fs-extra'

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
        createdAt: new Date().toISOString(),
        id: '',
        password: {key: '', type: 'plaintext'},
        permissions: {
            admin: false,
            groups: {},
        },
        profile: {
            displayName: '',
        },
        updatedAt: new Date().toISOString(),
        username: '',
    }
}
import type {WebSocketServerManager} from '@garage44/common/lib/ws-server'

export function registerUsersWebSocketApiRoutes(wsManager: WebSocketServerManager) {
    const apiWs = wsManager.api

    // WebSocket API for user presence updates
    apiWs.post('/api/users/presence', async (context, request) => {
        const {status, userid} = request.data

        // Broadcast user presence changes
        wsManager.broadcast('/users/presence', {
            status,
            timestamp: Date.now(),
            userid,
        })

        return {status: 'ok'}
    })
}

export default function(router: any) {
    // Register common avatar routes (placeholder images and uploaded avatars)
    const avatarRoutes = createAvatarRoutes({
        appName: 'pyrite',
        logger,
        runtime,
    })
    avatarRoutes.registerPlaceholderRoute(router)
    avatarRoutes.registerAvatarRoute(router)

    router.get('/api/users', async (req: Request, params: Record<string, string>, session: any) => {
        const users = await loadUsers()
        return new Response(JSON.stringify(users), {
            headers: {'Content-Type': 'application/json'},
        })
    })

    router.get('/api/users/template', async (req: Request, params: Record<string, string>, session: any) => {
        return new Response(JSON.stringify(userTemplate()), {
            headers: {'Content-Type': 'application/json'},
        })
    })

    /**
     * Get current user from session
     * GET /api/users/me
     * IMPORTANT: This must be registered BEFORE /api/users/:userid to avoid route matching issues
     */
    router.get('/api/users/me', async (req: Request, params: Record<string, string>, session: any) => {
        logger.info('[Users API] /api/users/me - HANDLER CALLED')
        logger.info(`[Users API] /api/users/me - session exists: ${!!session}, type: ${typeof session}`)
        logger.info(`[Users API] /api/users/me - session.userid: ${session?.userid || 'undefined/null'}`)

        if (!session?.userid) {
            logger.warn('[Users API] /api/users/me - No session.userid found - returning 401')
            return new Response(JSON.stringify({error: 'not authenticated'}), {
                headers: {'Content-Type': 'application/json'},
                status: 401,
            })
        }

        try {
            const username = session.userid
            logger.info(`[Users API] /api/users/me - Looking up user by username: "${username}"`)

            // List all users first to debug
            const allUsers = await userManager.listUsers()
            logger.info(`[Users API] /api/users/me - Total users in DB: ${allUsers.length}`)
            logger.info('[Users API] /api/users/me - Usernames in DB:', allUsers.map((u) => `"${u.username}"`).join(', '))

            const user = await userManager.getUserByUsername(username)
            if (!user) {
                logger.warn(`[Users API] /api/users/me - User not found for username: "${username}"`)
                logger.warn('[Users API] /api/users/me - Searching for exact match...')

                // Try exact match
                const exactMatch = allUsers.find((u) => u.username === username)
                logger.warn(`[Users API] /api/users/me - Exact match found: ${!!exactMatch}`)
                if (exactMatch) {
                    logger.warn('[Users API] /api/users/me - Exact match user:', {id: exactMatch.id, username: exactMatch.username})
                }

                return new Response(JSON.stringify({error: 'user not found'}), {
                    headers: {'Content-Type': 'application/json'},
                    status: 404,
                })
            }

            logger.info('[Users API] /api/users/me - Found user:', {id: user.id, username: user.username})
            return new Response(JSON.stringify(user), {
                headers: {'Content-Type': 'application/json'},
            })
        } catch (error) {
            logger.error('[Users API] Error getting current user:', error)
            return new Response(JSON.stringify({error: 'failed to get user'}), {
                headers: {'Content-Type': 'application/json'},
                status: 500,
            })
        }
    })

    router.get('/api/users/:userid', async (req: Request, params: Record<string, string>, session: any) => {
        const userId = params.param0
        // Basic path traversal protection
        if (userId.match(/\.\.\//g) !== null) {
            return new Response(JSON.stringify({error: 'invalid user id'}), {
                headers: {'Content-Type': 'application/json'},
                status: 400,
            })
        }

        const users = await loadUsers()
        const user = users.find((i) => i.id === userId)
        // User doesn't exist yet
        if (!user) {
            return new Response(JSON.stringify({error: 'user not found'}), {
                headers: {'Content-Type': 'application/json'},
                status: 404,
            })
        }
        return new Response(JSON.stringify(user), {
            headers: {'Content-Type': 'application/json'},
        })
    })

    router.post('/api/users/:userid', async (req: Request, params: Record<string, string>, session: any) => {
        const userId = params.param0
        const userData = await req.json()
        await saveUser(userId, userData)
        await syncUsers()
        const user = await loadUser(userId)
        return new Response(JSON.stringify(user), {
            headers: {'Content-Type': 'application/json'},
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
            headers: {'Content-Type': 'application/json'},
        })
    })

    router.post('/api/users/:userid/avatar', async (req: Request, params: Record<string, string>, session: any) => {
        const userId = params.param0

        logger.info(`[Users API] POST /api/users/:userid/avatar - userId from params: ${userId}`)

        // Basic path traversal protection
        if (userId.match(/\.\.\//g) !== null) {
            return new Response(JSON.stringify({error: 'invalid user id'}), {
                headers: {'Content-Type': 'application/json'},
                status: 400,
            })
        }

        // Check if user exists
        logger.info(`[Users API] Looking up user with ID: ${userId}`)
        const user = await loadUser(userId)
        if (!user) {
            logger.warn(`[Users API] User not found for ID: ${userId}`)
            // List all users to debug
            const allUsers = await userManager.listUsers()
            logger.warn('[Users API] Available user IDs:', allUsers.map((u) => u.id).join(', '))
            return new Response(JSON.stringify({error: 'user not found'}), {
                headers: {'Content-Type': 'application/json'},
                status: 404,
            })
        }

        logger.info('[Users API] Found user:', {avatar: user.profile?.avatar, id: user.id, username: user.username})

        try {
            // Parse multipart form data
            const formData = await req.formData()
            const file = formData.get('avatar') as File | null

            if (!file) {
                return new Response(JSON.stringify({error: 'no file provided'}), {
                    headers: {'Content-Type': 'application/json'},
                    status: 400,
                })
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                return new Response(JSON.stringify({error: 'invalid file type. allowed: jpeg, png, webp'}), {
                    headers: {'Content-Type': 'application/json'},
                    status: 400,
                })
            }

            // Validate file size (max 2MB)
            const maxSize = 2 * 1024 * 1024 // 2MB
            if (file.size > maxSize) {
                return new Response(JSON.stringify({error: 'file too large. max size: 2MB'}), {
                    headers: {'Content-Type': 'application/json'},
                    status: 400,
                })
            }

            // Determine file extension from MIME type
            const extMap: Record<string, string> = {
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/png': 'png',
                'image/webp': 'webp',
            }
            const ext = extMap[file.type] || 'png'

            // Create avatars directory if it doesn't exist (using ~/.{appName}/avatars/ convention)
            const avatarsDir = getAvatarStoragePath('pyrite')
            await fs.ensureDir(avatarsDir)

            // Save file with userId as filename
            const filename = `${userId}.${ext}`
            const filePath = path.join(avatarsDir, filename)

            // Convert File to Buffer and write to disk
            const arrayBuffer = await file.arrayBuffer()
            await Bun.write(filePath, arrayBuffer)

            logger.info(`[Users API] Saved avatar for user ${userId}: ${filePath}`)

            // Update user avatar in database
            const avatarFilename = filename
            logger.info(`[Users API] Updating user ${userId} avatar in DB to: ${avatarFilename}`)
            logger.info('[Users API] Current user profile before update:', JSON.stringify(user.profile))

            const updatedUser = await userManager.updateUser(userId, {
                profile: {
                    ...user.profile,
                    avatar: avatarFilename,
                },
            })

            if (!updatedUser) {
                logger.error(`[Users API] Failed to update user ${userId} - updateUser returned null`)
                return new Response(JSON.stringify({error: 'failed to update user in database'}), {
                    headers: {'Content-Type': 'application/json'},
                    status: 500,
                })
            }

            logger.info(`[Users API] User updated successfully. New avatar: ${updatedUser.profile.avatar}`)

            // Verify the update by fetching the user again
            const verifyUser = await userManager.getUser(userId)
            if (verifyUser) {
                logger.info(`[Users API] Verified user avatar in DB: ${verifyUser.profile.avatar}`)
            } else {
                logger.warn('[Users API] Could not verify user update - getUser returned null')
            }

            // Return success with avatar URL
            return new Response(JSON.stringify({
                avatar: avatarFilename,
                success: true,
                url: `/avatars/${avatarFilename}`,
            }), {
                headers: {'Content-Type': 'application/json'},
            })
        } catch (error) {
            logger.error(`[Users API] Error uploading avatar for user ${userId}:`, error)
            return new Response(JSON.stringify({error: 'failed to upload avatar'}), {
                headers: {'Content-Type': 'application/json'},
                status: 500,
            })
        }
    })
}
