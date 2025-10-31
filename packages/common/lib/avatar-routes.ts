/**
 * Common avatar serving routes for all apps
 * Uses ~/.{appName}/avatars/ convention for uploaded avatars
 * Placeholder images are served from /img/ directory
 */

import path from 'node:path'
import {homedir} from 'node:os'
import type {Logger} from './logger'

interface AvatarRoutesOptions {
    appName: string
    logger?: Logger
    runtime: {
        service_dir: string
    }
}

/**
 * Register common avatar routes (placeholder images and uploaded avatars)
 * Returns router configuration functions that can be called to add routes
 */
export function createAvatarRoutes(options: AvatarRoutesOptions) {
    const {appName, logger, runtime} = options

    return {
        /**
         * Register route for serving placeholder images from /img/
         */
        registerPlaceholderRoute: (router: any) => {
            router.get('/img/:filename', async (req: Request, params: Record<string, string>, session: any) => {
                const filename = params.param0
                
                // Basic path traversal protection
                if (filename.match(/\.\.\//g) !== null || filename.includes('/')) {
                    return new Response(JSON.stringify({error: 'invalid filename'}), {
                        headers: { 'Content-Type': 'application/json' },
                        status: 400
                    })
                }

                // Get public directory path (public/img/)
                const publicPath = path.join(runtime.service_dir, 'public', 'img', filename)

                try {
                    const file = Bun.file(publicPath)
                    if (await file.exists()) {
                        // Determine content type from file extension
                        const ext = path.extname(filename).toLowerCase()
                        const contentTypeMap: Record<string, string> = {
                            '.jpg': 'image/jpeg',
                            '.jpeg': 'image/jpeg',
                            '.png': 'image/png',
                            '.webp': 'image/webp',
                            '.svg': 'image/svg+xml'
                        }
                        const contentType = contentTypeMap[ext] || 'image/png'

                        return new Response(file, {
                            headers: { 'Content-Type': contentType }
                        })
                    } else {
                        return new Response(JSON.stringify({error: 'image not found'}), {
                            headers: { 'Content-Type': 'application/json' },
                            status: 404
                        })
                    }
                } catch (error) {
                    logger?.error(`[Avatar Routes] Error serving image ${filename}:`, error)
                    return new Response(JSON.stringify({error: 'failed to serve image'}), {
                        headers: { 'Content-Type': 'application/json' },
                        status: 500
                    })
                }
            })
        },

        /**
         * Register route for serving uploaded avatars from ~/.{appName}/avatars/
         */
        registerAvatarRoute: (router: any) => {
            router.get('/avatars/:filename', async (req: Request, params: Record<string, string>, session: any) => {
                const filename = params.param0
                
                // Basic path traversal protection
                if (filename.match(/\.\.\//g) !== null || filename.includes('/')) {
                    return new Response(JSON.stringify({error: 'invalid filename'}), {
                        headers: { 'Content-Type': 'application/json' },
                        status: 400
                    })
                }

                // Use ~/.{appName}/avatars/ convention
                const avatarsDir = path.join(homedir(), `.${appName}`, 'avatars')
                const filePath = path.join(avatarsDir, filename)

                try {
                    const file = Bun.file(filePath)
                    if (await file.exists()) {
                        // Determine content type from file extension
                        const ext = path.extname(filename).toLowerCase()
                        const contentTypeMap: Record<string, string> = {
                            '.jpg': 'image/jpeg',
                            '.jpeg': 'image/jpeg',
                            '.png': 'image/png',
                            '.webp': 'image/webp'
                        }
                        const contentType = contentTypeMap[ext] || 'image/png'

                        return new Response(file, {
                            headers: { 'Content-Type': contentType }
                        })
                    } else {
                        return new Response(JSON.stringify({error: 'avatar not found'}), {
                            headers: { 'Content-Type': 'application/json' },
                            status: 404
                        })
                    }
                } catch (error) {
                    logger?.error(`[Avatar Routes] Error serving avatar ${filename}:`, error)
                    return new Response(JSON.stringify({error: 'failed to serve avatar'}), {
                        headers: { 'Content-Type': 'application/json' },
                        status: 500
                    })
                }
            })
        }
    }
}

/**
 * Get avatar storage directory path using ~/.{appName}/avatars/ convention
 */
export function getAvatarStoragePath(appName: string): string {
    return path.join(homedir(), `.${appName}`, 'avatars')
}

