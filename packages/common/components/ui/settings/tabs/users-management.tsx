import {useEffect, useState} from 'preact/hooks'
import {Icon, Button} from '@garage44/common/components'
import {api, notifier} from '@garage44/common/app'
import {deepSignal} from 'deepsignal'
import './users-management.css'

export interface User {
    id: string
    username: string
    profile?: {
        displayName?: string
        avatar?: string
    }
    permissions?: {
        admin?: boolean
    }
    createdAt?: string
    updatedAt?: string
}

export interface UsersManagementTabProps {
    /**
     * Translation function
     */
    $t?: (key: string) => string
}

// State defined outside component for stability
const state = deepSignal({
    users: [] as User[],
    selectedUser: null as User | null,
    editingUser: null as User | null,
    isCreating: false,
    loading: false,
    error: null as string | null,
})

/**
 * User Management Settings Tab Component
 * Provides full CRUD functionality for user management
 */
export function UsersManagement({
    $t = (key: string) => key,
}: UsersManagementTabProps) {
    const [initialized, setInitialized] = useState(false)

    // Load users on mount
    useEffect(() => {
        if (!initialized) {
            loadUsers()
            setInitialized(true)
        }
    }, [initialized])

    const loadUsers = async () => {
        try {
            state.loading = true
            state.error = null
            const users = await api.get('/api/users')
            state.users = users
        } catch (error) {
            state.error = 'Failed to load users'
            notifier.notify({
                icon: 'Error',
                message: $t('user.management.error.load_failed'),
                type: 'error',
            })
        } finally {
            state.loading = false
        }
    }

    const handleCreateUser = async () => {
        try {
            // Get user template from API
            const template = await api.get('/api/users/template')
            state.editingUser = {
                ...template,
                username: '',
                profile: {
                    displayName: '',
                },
                permissions: {
                    admin: false,
                },
            }
            state.isCreating = true
        } catch (error) {
            notifier.notify({
                icon: 'Error',
                message: $t('user.management.error.create_failed'),
                type: 'error',
            })
        }
    }

    const handleEditUser = (user: User) => {
        state.editingUser = {...user}
        state.isCreating = false
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
                // Update existing user
                const updatedUser = await api.post(`/api/users/${state.editingUser.id}`, state.editingUser)
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
        } catch (error) {
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
        } catch (error) {
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
    }

    return (
        <section class="c-users-management-tab">
            {state.loading && <div class="loading">Loading...</div>}
            {state.error && <div class="error">{state.error}</div>}

            <div class="actions-header">
                <Button
                    icon="add"
                    label={$t('user.management.action.add_user')}
                    onClick={handleCreateUser}
                    variant="menu"
                    disabled={state.loading || !!state.editingUser}
                />
            </div>

            {state.editingUser ? (
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
                        <label>{$t('user.management.field.display_name')}</label>
                        <input
                            type="text"
                            value={state.editingUser.profile?.displayName || ''}
                            onInput={(e) => {
                                if (state.editingUser) {
                                    if (!state.editingUser.profile) state.editingUser.profile = {}
                                    state.editingUser.profile.displayName = (e.target as HTMLInputElement).value
                                }
                            }}
                            placeholder={$t('user.management.placeholder.display_name')}
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
            ) : (
                <div class="users-list">
                    {state.users.length === 0 && !state.loading && (
                        <div class="empty-state">
                            {$t('user.management.empty')}
                        </div>
                    )}

                    {state.users.map((user) => (
                        <div key={user.id} class="user-item">
                            <div class="user-info">
                                <Icon name="account" class="user-icon" />
                                <div class="user-details">
                                    <div class="username">{user.username}</div>
                                    {user.profile?.displayName && (
                                        <div class="display-name">{user.profile.displayName}</div>
                                    )}
                                    {user.permissions?.admin && (
                                        <span class="admin-badge">{$t('user.management.badge.admin')}</span>
                                    )}
                                </div>
                            </div>
                            <div class="user-actions">
                                <Icon
                                    name="edit"
                                    onClick={() => handleEditUser(user)}
                                    tip={$t('user.management.action.edit')}
                                    class="action-icon"
                                />
                                <Icon
                                    name="delete"
                                    onClick={() => handleDeleteUser(user)}
                                    tip={$t('user.management.action.delete')}
                                    class="action-icon delete"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
