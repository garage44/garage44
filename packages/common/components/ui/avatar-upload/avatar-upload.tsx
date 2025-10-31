import {useRef, useState, useEffect} from 'preact/hooks'
import {Icon} from '@garage44/common/components'
import {api, notifier, logger} from '@garage44/common/app'
import {getAvatarUrl} from '@garage44/common/lib/avatar'
import './avatar-upload.css'

interface AvatarUploadProps {
    /**
     * Function to get avatar from global state
     * @default (state) => state?.profile?.avatar || state?.user?.profile?.avatar || 'placeholder-1.png'
     */
    getAvatar?: (state: any) => string
    /**
     * Function to get user ID from global state
     * @default (state) => state?.profile?.id || state?.user?.id || null
     */
    getUserId?: (state: any) => string | null
    /**
     * Function to update avatar in global state
     * @default (state, avatar, userId) => { if (state?.profile) state.profile.avatar = avatar; if (state?.user?.profile) state.user.profile.avatar = avatar }
     */
    setAvatar?: (state: any, avatar: string, userId: string | null) => void
    /**
     * Function to update profile in global state
     * @default (state, user) => { updates both state.profile and state.user.profile if available }
     */
    setProfile?: (state: any, user: any) => void
    /**
     * Global state object (typically $s from app)
     * Used to get/set profile information
     */
    state?: any
    /**
     * Path to user endpoint (e.g., '/api/users/me')
     * @default '/api/users/me'
     */
    userEndpoint?: string
}

/**
 * Avatar Upload Component
 * Allows users to upload a new avatar image
 */
export function AvatarUpload({
    getAvatar = (s) => s?.profile?.avatar || s?.user?.profile?.avatar || 'placeholder-1.png',
    getUserId = (s) => s?.profile?.id || s?.user?.id || null,
    setAvatar = (s, avatar: string, userId: string | null) => {
        if (s?.profile) {
            s.profile.avatar = avatar
        }
        if (s?.user?.profile) {
            s.user.profile.avatar = avatar
        }
    },
    setProfile = (s, user: any) => {
        // Update profile state if it exists
        if (s?.profile && user?.id) {
            s.profile.id = user.id
            s.profile.username = user.username || ''
            s.profile.displayName = user.profile?.displayName || user.username || 'User'
            s.profile.avatar = user.profile?.avatar || 'placeholder-1.png'
        }
        // Update user.profile state if it exists
        if (s?.user && user?.id) {
            s.user.id = user.id
            if (!s.user.profile) {
                s.user.profile = {}
            }
            s.user.profile.avatar = user.profile?.avatar || 'placeholder-1.png'
            s.user.profile.displayName = user.profile?.displayName || user.username || 'User'
        }
    },
    state = null,
    userEndpoint = '/api/users/me',
}: AvatarUploadProps = {}) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)

    // Load current user info on mount if profile is not set
    useEffect(() => {
        (async () => {
            const userId = state ? getUserId(state) : null
            if (!userId) {
                try {
                    const user = await api.get(userEndpoint)
                    logger.debug('[AvatarUpload] Received user from API:', user)
                    if (user?.id && state) {
                        setProfile(state, user)
                    } else {
                        logger.warn('[AvatarUpload] User response missing id:', user)
                        notifier.notify({
                            level: 'error',
                            message: 'Failed to load user information. Please refresh the page.',
                        })
                    }
                } catch (error) {
                    logger.error('[AvatarUpload] Error loading user:', error)
                    notifier.notify({
                        level: 'error',
                        message: 'Failed to load user information. Please refresh the page.',
                    })
                }
            }
        })()
    }, [])

    const handleFileSelect = (e: Event) => {
        const input = e.target as HTMLInputElement
        const file = input.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            notifier.notify({
                level: 'error',
                message: 'Invalid file type. Please select a JPEG, PNG, or WebP image.',
            })
            return
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024 // 2MB
        if (file.size > maxSize) {
            notifier.notify({
                level: 'error',
                message: 'File too large. Maximum size is 2MB.',
            })
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleUpload = async () => {
        const fileInput = fileInputRef.current
        if (!fileInput?.files?.length) {
            notifier.notify({
                level: 'error',
                message: 'Please select an image file.',
            })
            return
        }

        const userId = state ? getUserId(state) : null
        if (!userId) {
            notifier.notify({
                level: 'error',
                message: 'Could not determine current user. Please try again.',
            })
            return
        }

        const file = fileInput.files[0]
        setUploading(true)

        try {
            // Create FormData
            const formData = new FormData()
            formData.append('avatar', file)

            // Upload via fetch (multipart/form-data)
            const response = await fetch(`/api/users/${userId}/avatar`, {
                body: formData,
                credentials: 'same-origin',
                method: 'POST',
                // Don't set Content-Type - browser will set it with boundary
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Upload failed')
            }

            // Reload user data from API to ensure everything is in sync
            const userResponse = await fetch(userEndpoint, {
                credentials: 'same-origin',
            })

            let finalAvatar = result.avatar // Default to result.avatar

            if (userResponse.ok) {
                const userData = await userResponse.json()
                logger.info('[AvatarUpload] Reloaded user data from API:', {avatar: userData.profile?.avatar, id: userData.id})

                // Use the avatar from the API response (authoritative source)
                finalAvatar = userData.profile?.avatar || result.avatar

                // Update profile state
                if (state) {
                    setProfile(state, userData)
                }

                logger.info(`[AvatarUpload] Updated avatar to: ${finalAvatar}`)
            } else {
                logger.warn('[AvatarUpload] Failed to reload user data from API, using result.avatar')
                // Fallback: update with result.avatar
                if (state) {
                    setAvatar(state, result.avatar, userId)
                }
            }

            // Clear preview and file input
            setPreview(null)
            fileInput.value = ''

            notifier.notify({
                level: 'success',
                message: 'Avatar uploaded successfully!',
            })
        } catch (error) {
            logger.error('[AvatarUpload] Upload error:', error)
            notifier.notify({
                level: 'error',
                message: error instanceof Error ? error.message : 'Failed to upload avatar',
            })
        } finally {
            setUploading(false)
        }
    }

    // Get current avatar for display
    const currentAvatar = state ? getAvatar(state) : 'placeholder-1.png'
    const userId = state ? getUserId(state) : null
    const currentAvatarUrl = getAvatarUrl(currentAvatar, userId || undefined)

    return (
        <div class="c-avatar-upload">
            <label class="avatar-label">Profile Picture</label>

            <div class="avatar-preview-section">
                <div class="avatar-preview">
                    {preview ? (
                        <img src={preview} alt="Preview" class="avatar-preview-img" />
                    ) : (
                        <img src={currentAvatarUrl} alt="Current avatar" class="avatar-preview-img" key={currentAvatar} />
                    )}
                </div>

                <div class="avatar-actions">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleFileSelect}
                        class="avatar-file-input"
                        disabled={uploading}
                        id="avatar-file-input"
                    />
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (fileInputRef.current) {
                                fileInputRef.current.click()
                            }
                        }}
                        disabled={uploading}
                        class="btn btn-secondary"
                    >
                        <Icon name="upload" type="info" />
                        {preview ? 'Change' : 'Choose Image'}
                    </button>

                    {preview && (
                        <>
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={uploading}
                                class="btn btn-primary"
                            >
                                {uploading ? (
                                    <>
                                        <Icon name="loading" type="info" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="save" type="info" />
                                        Upload
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setPreview(null)
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = ''
                                    }
                                }}
                                disabled={uploading}
                                class="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>

            <p class="avatar-help">
                Supported formats: JPEG, PNG, WebP. Maximum size: 2MB.
            </p>
        </div>
    )
}
