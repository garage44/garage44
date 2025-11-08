import {useEffect, useState, useCallback} from 'preact/hooks'
import {route, getCurrentUrl} from 'preact-router'
import {Icon, Button, CollectionView} from '@/components'
import {api, notifier} from '@/app'
import {deepSignal} from 'deepsignal'
import './users-management.css'

export interface User {
    createdAt?: string
    id: string
    password?: {
        key: string
        type: 'plaintext' | 'bcrypt'
    }
    permissions?: {
        admin?: boolean
    }
    profile?: {
        avatar?: string
        displayName?: string
    }
    updatedAt?: string
    username: string
}

export interface UsersManagementTabProps {
    /**
     * Translation function
     */
    $t?: (key: string) => string
}

// State defined outside component for stability
const state = deepSignal({
    editingUser: null as User | null,
    error: null as string | null,
    isCreating: false,
    loading: false,
    selectedUser: null as User | null,
    users: [] as User[],
})

/**
 * User Management Settings Tab Component
 * Provides full CRUD functionality for user management
 */
export function UsersManagement({
    $t = (key: string) => key,
}: UsersManagementTabProps) {
    const [initialized, setInitialized] = useState(false)

    const loadUsers = useCallback(async () => {
        try {
            state.loading = true
            state.error = null
            const users = await api.get('/api/users')
            state.users = users
        } catch {
            state.error = 'Failed to load users'
            notifier.notify({
                icon: 'Error',
                message: $t('user.management.error.load_failed'),
                type: 'error',
            })
        } finally {
            state.loading = false
        }
    }, [$t])

    // Load users on mount
    useEffect(() => {
        if (!initialized) {
            loadUsers()
            setInitialized(true)
        }
    }, [initialized, loadUsers])


    const handleCreateUser = () => {
        route('/settings/users/new')
    }

    const handleEditUser = (user: User) => {
        route(`/settings/users/${user.id}`)
    }

    const handleSaveUser = async () => {
        if (!state.editingUser) return

        try {
            // Validate required fields
            if (!state.editingUser.username) {
                notifier.notify({
                    icon: 'Warning',
                    message: $t('user.management.error.username_required'),
                    type: 'warning',
                })
                return
            }

            state.loading = true

            if (state.isCreating) {
                // Create new user - POST to /api/users/:userid
                const newUser = await api.post(`/api/users/${state.editingUser.username}`, state.editingUser)
                state.users.push(newUser)
                notifier.notify({
                    icon: 'Success',
                    message: $t('user.management.success.created'),
                    type: 'success',
                })
            } else {
                // Update existing user - only send password if it was changed
                const userData: Partial<User> = {
                    ...state.editingUser,
                }

                // Only include password if it was provided (not empty)
                if (!userData.password || !userData.password.key || userData.password.key.trim() === '') {
                    // Remove password from update if it's empty
                    delete userData.password
                }

                const updatedUser = await api.post(`/api/users/${state.editingUser.id}`, userData)
                const index = state.users.findIndex((u) => u.id === updatedUser.id)
                if (index !== -1) {
                    state.users[index] = updatedUser
                }
                notifier.notify({
                    icon: 'Success',
                    message: $t('user.management.success.updated'),
                    type: 'success',
                })
            }

            state.editingUser = null
            state.isCreating = false
            await loadUsers()
            route('/settings/users')
        } catch {
            notifier.notify({
                icon: 'Error',
                message: $t('user.management.error.save_failed'),
                type: 'error',
            })
        } finally {
            state.loading = false
        }
    }

    const handleDeleteUser = async (user: User) => {
        if (!confirm($t('user.management.confirm.delete').replace('{username}', user.username))) {
            return
        }

        try {
            state.loading = true
            await api.get(`/api/users/${user.id}/delete`)
            state.users = state.users.filter((u) => u.id !== user.id)

            if (state.editingUser?.id === user.id) {
                state.editingUser = null
            }

            notifier.notify({
                icon: 'Success',
                message: $t('user.management.success.deleted'),
                type: 'success',
            })
        } catch {
            notifier.notify({
                icon: 'Error',
                message: $t('user.management.error.delete_failed'),
                type: 'error',
            })
        } finally {
            state.loading = false
        }
    }

    const handleCancelEdit = () => {
        state.editingUser = null
        state.isCreating = false
        route('/settings/users')
    }


    const UserOverview = () => {
        const url = getCurrentUrl()
        const isOverview = url === '/settings/users'

        return (
            <>
                {isOverview && (
                    <div class="actions-header">
                        <Button
                            icon="add"
                            label={$t('user.management.action.add_user')}
                            onClick={handleCreateUser}
                            variant="context"
                            disabled={state.loading}
                        />
                    </div>
                )}

                <CollectionView
                    className="users-list"
                    columns={[
                        {
                            flex: true,
                            label: $t('user.management.field.username'),
                            minWidth: '200px',
                            render: (user) => (
                                <div class="user-username-cell">
                                    <Icon name="account" className="user-icon" />
                                    <span class="username">{user.username}</span>
                                </div>
                            ),
                        },
                        {
                            center: true,
                            label: $t('user.management.badge.admin'),
                            render: (user) =>
                                user.permissions?.admin ? (
                                    <span class="admin-badge">{$t('user.management.badge.admin')}</span>
                                ) : (
                                    <span class="user-role-empty">—</span>
                                ),
                            width: '120px',
                        },
                    ]}
                    items={state.users}
                    emptyMessage={state.loading ? undefined : $t('user.management.empty')}
                    row_actions={(user) => (
                        <>
                            <Button
                                icon="edit"
                                onClick={() => handleEditUser(user)}
                                tip={$t('user.management.action.edit')}
                                variant="toggle"
                                type="info"
                            />
                            <Button
                                icon="trash"
                                onClick={() => handleDeleteUser(user)}
                                tip={$t('user.management.action.delete')}
                                variant="toggle"
                                type="danger"
                            />
                        </>
                    )}
                />
            </>
        )
    }

    const UserEditor = ({userId}: {userId?: string}) => {
        useEffect(() => {
            if (userId === 'new') {
                // Load template for new user
                api.get('/api/users/template').then((template) => {
                    state.editingUser = {
                        ...template,
                        permissions: {
                            admin: false,
                        },
                        profile: {
                            displayName: '',
                        },
                        username: '',
                    }
                    state.isCreating = true
                }).catch(() => {
                    notifier.notify({
                        icon: 'Error',
                        message: $t('user.management.error.create_failed'),
                        type: 'error',
                    })
                })
            } else if (userId) {
                // Load user for editing
                api.get(`/api/users/${userId}`).then((user) => {
                    state.editingUser = user
                    state.isCreating = false
                }).catch(() => {
                    notifier.notify({
                        icon: 'Error',
                        message: $t('user.management.error.load_failed'),
                        type: 'error',
                    })
                    route('/settings/users')
                })
            }

            return () => {
                // Cleanup: clear editing state when component unmounts
                state.editingUser = null
                state.isCreating = false
            }
        }, [userId])

        if (!state.editingUser) return null

        return (
            <div class="user-editor">
                <h3>{state.isCreating ? $t('user.management.title.create') : $t('user.management.title.edit')}</h3>

                <div class="form-group">
                    <label>{$t('user.management.field.username')}</label>
                    <input
                        type="text"
                        value={state.editingUser.username}
                        onInput={(e) => {
                            if (state.editingUser) {
                                state.editingUser.username = (e.target as HTMLInputElement).value
                            }
                        }}
                        disabled={!state.isCreating}
                        placeholder={$t('user.management.placeholder.username')}
                    />
                </div>

                <div class="form-group">
                    <label>{$t('user.management.field.password')}</label>
                    <input
                        type="password"
                        value={state.editingUser.password?.key || ''}
                        onInput={(e) => {
                            if (state.editingUser) {
                                if (!state.editingUser.password) {
                                    state.editingUser.password = {
                                        key: '',
                                        type: 'plaintext',
                                    }
                                }
                                state.editingUser.password.key = (e.target as HTMLInputElement).value
                            }
                        }}
                        placeholder={state.isCreating ? $t('user.management.placeholder.password') : $t('user.management.placeholder.password_optional')}
                    />
                </div>

                <div class="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            checked={state.editingUser.permissions?.admin || false}
                            onChange={(e) => {
                                if (state.editingUser) {
                                    if (!state.editingUser.permissions) state.editingUser.permissions = {}
                                    state.editingUser.permissions.admin = (e.target as HTMLInputElement).checked
                                }
                            }}
                        />
                        {$t('user.management.field.admin')}
                    </label>
                </div>

                <div class="editor-actions">
                    <Button
                        icon="save"
                        label={$t('user.management.action.save')}
                        onClick={handleSaveUser}
                        variant="menu"
                        disabled={state.loading}
                    />
                    <Button
                        icon="close"
                        label={$t('user.management.action.cancel')}
                        onClick={handleCancelEdit}
                        variant="menu"
                        disabled={state.loading}
                    />
                </div>
            </div>
        )
    }

    // Track current URL and update on route changes
    const [currentUrl, setCurrentUrl] = useState(() => getCurrentUrl())

    // Listen to route changes
    useEffect(() => {
        const checkUrl = () => {
            const url = getCurrentUrl()
            if (url !== currentUrl) {
                setCurrentUrl(url)
            }
        }

        // Check URL on mount
        checkUrl()

        // Listen to popstate events (browser back/forward)
        window.addEventListener('popstate', checkUrl)

        // Listen to pushState/replaceState by intercepting history methods
        const originalPushState = history.pushState
        const originalReplaceState = history.replaceState

        history.pushState = function(...args) {
            originalPushState.apply(history, args)
            setTimeout(checkUrl, 0)
        }

        history.replaceState = function(...args) {
            originalReplaceState.apply(history, args)
            setTimeout(checkUrl, 0)
        }

        return () => {
            window.removeEventListener('popstate', checkUrl)
            history.pushState = originalPushState
            history.replaceState = originalReplaceState
        }
    }, [currentUrl])

    // Determine which view to show based on current URL
    const isNewUser = currentUrl === '/settings/users/new'
    const isEditUser = currentUrl.startsWith('/settings/users/') && currentUrl !== '/settings/users' && currentUrl !== '/settings/users/new'
    const userId = isEditUser ? currentUrl.split('/settings/users/')[1] : undefined

    // Load user data when route changes
    useEffect(() => {
        if (isNewUser) {
            // Load template for new user
            api.get('/api/users/template').then((template) => {
                state.editingUser = {
                    ...template,
                    permissions: {
                        admin: false,
                    },
                    profile: {
                        displayName: '',
                    },
                    username: '',
                }
                state.isCreating = true
            }).catch(() => {
                notifier.notify({
                    icon: 'Error',
                    message: $t('user.management.error.create_failed'),
                    type: 'error',
                })
            })
        } else if (isEditUser && userId && userId !== 'new') {
            // Load user for editing
            api.get(`/api/users/${userId}`).then((user) => {
                // Clear password field when loading for editing (don't show actual password)
                state.editingUser = {
                    ...user,
                    password: {
                        key: '',
                        type: 'plaintext',
                    },
                }
                state.isCreating = false
            }).catch(() => {
                notifier.notify({
                    icon: 'Error',
                    message: $t('user.management.error.load_failed'),
                    type: 'error',
                })
                route('/settings/users')
            })
        } else if (currentUrl === '/settings/users') {
            // Overview page - clear editing state
            state.editingUser = null
            state.isCreating = false
        }
    }, [currentUrl, userId, isNewUser, isEditUser, $t])

    // Determine which view to show - check URL first, then state
    const showEditor = isNewUser || isEditUser
    const showOverview = currentUrl === '/settings/users' || (!showEditor && !state.editingUser)

    return (
        <section class="c-users-management-tab">
            {state.loading && <div class="loading">Loading...</div>}
            {state.error && <div class="error">{state.error}</div>}

            {showEditor ? (
                <UserEditor userId={userId || (isNewUser ? 'new' : undefined)} />
            ) : showOverview ? (
                <UserOverview />
            ) : null}
        </section>
    )
}
