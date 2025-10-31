import {useRef, useState, useEffect} from 'preact/hooks'
import {Icon} from '@garage44/common/components'
import {$s} from '@/app'
import {api, notifier, logger} from '@garage44/common/app'
import {getAvatarUrl} from '@garage44/common/lib/avatar'
import './avatar-upload.css'

/**
 * Avatar Upload Component
 * Allows users to upload a new avatar image
 */
export default function AvatarUpload() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)

    // Load current user info on mount if profile is not set
    useEffect(() => {
        (async () => {
            if (!$s.profile.id) {
                try {
                    const user = await api.get('/api/users/me')
                    logger.debug('[AvatarUpload] Received user from /api/users/me:', user)
                    if (user?.id) {
                        $s.profile.id = user.id
                        $s.profile.username = user.username || ''
                        $s.profile.displayName = user.profile?.displayName || user.username || 'User'
                        $s.profile.avatar = user.profile?.avatar || 'placeholder-1.png'
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

        if (!$s.profile.id) {
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
            const response = await fetch(`/api/users/${$s.profile.id}/avatar`, {
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
            const userResponse = await fetch('/api/users/me', {
                credentials: 'same-origin',
            })

            let finalAvatar = result.avatar // Default to result.avatar

            if (userResponse.ok) {
                const userData = await userResponse.json()
                logger.info('[AvatarUpload] Reloaded user data from API:', {avatar: userData.profile?.avatar, id: userData.id})

                // Use the avatar from the API response (authoritative source)
                finalAvatar = userData.profile?.avatar || result.avatar

                // Update global profile state
                $s.profile.id = userData.id
                $s.profile.username = userData.username || ''
                $s.profile.displayName = userData.profile?.displayName || userData.username || 'User'
                $s.profile.avatar = finalAvatar

                // Ensure $s.user.id is set for backward compatibility
                if (!$s.user.id) {
                    $s.user.id = userData.id
                    logger.info(`[AvatarUpload] Set $s.user.id to: ${userData.id}`)
                }

                // Update global users state - ensure entry exists
                if (!$s.chat.users) {
                    $s.chat.users = {}
                }

                // Update for the user ID (multiple entries for backward compatibility)
                if (userData.id) {
                    $s.chat.users[userData.id] = {
                        avatar: finalAvatar,
                        username: $s.profile.username,
                    }
                    logger.info(`[AvatarUpload] Updated $s.chat.users[${userData.id}] with avatar: ${finalAvatar}`)
                }

                logger.info(`[AvatarUpload] Updated $s.profile.avatar to: ${finalAvatar}`)
            } else {
                logger.warn('[AvatarUpload] Failed to reload user data from API, using result.avatar')
                // Fallback: update with result.avatar
                if ($s.profile.id) {
                    $s.profile.avatar = result.avatar
                }
                if (!$s.chat.users) {
                    $s.chat.users = {}
                }
                if ($s.profile.id) {
                    if ($s.chat.users[$s.profile.id]) {
                        $s.chat.users[$s.profile.id].avatar = result.avatar
                    } else {
                        $s.chat.users[$s.profile.id] = {
                            avatar: result.avatar,
                            username: $s.profile.username || 'User',
                        }
                    }
                }
            }

            // Update admin user state if available
            if ($s.admin.user?.id === $s.profile.id) {
                $s.admin.user.profile.avatar = finalAvatar
                logger.info(`[AvatarUpload] Updated $s.admin.user.profile.avatar to: ${finalAvatar}`)
            }

            logger.info(`[AvatarUpload] Updated $s.profile.avatar to: ${finalAvatar}`)

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

    // Get current avatar for display from global profile state
    const currentAvatar = $s.profile.avatar || 'placeholder-1.png'
    const currentAvatarUrl = getAvatarUrl(currentAvatar, $s.profile.id || undefined)

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
