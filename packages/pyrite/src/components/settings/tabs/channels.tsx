import {FieldText, Button} from '@garage44/common/components'
import {useEffect, useRef} from 'preact/hooks'
import {deepSignal} from 'deepsignal'
import {api, notifier} from '@garage44/common/app'
import type {Channel} from '@/types'

export default function TabChannels() {
    // Use DeepSignal for component state (per-instance, stable across renders)
    const stateRef = useRef(deepSignal({
        channels: [] as Channel[],
        loading: false,
        syncing: false,
        editing: null as number | null,
        formData: {
            description: '',
            name: '',
            slug: '',
        },
    }))
    const state = stateRef.current

    const loadChannels = async () => {
        state.loading = true
        try {
            const data = await api.get('/api/channels')
            state.channels = Array.isArray(data) ? data : []
        } catch {
            notifier.notify({level: 'error', message: 'Failed to load channels'})
        } finally {
            state.loading = false
        }
    }

    useEffect(() => {
        loadChannels()
    }, [])

    const handleCreate = async () => {
        if (!state.formData.name || !state.formData.slug) {
            notifier.notify({level: 'error', message: 'Name and slug are required'})
            return
        }

        try {
            const newChannel = await api.post('/api/channels', {
                name: state.formData.name,
                slug: state.formData.slug,
                description: state.formData.description,
            })
            state.channels = [...state.channels, newChannel]
            state.formData = {description: '', name: '', slug: ''}
            notifier.notify({level: 'success', message: 'Channel created and synced with Galene'})
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create channel'
            notifier.notify({level: 'error', message})
        }
    }

    const handleUpdate = async (channelId: number) => {
        try {
            const updated = await api.put(`/api/channels/${channelId}`, {
                name: state.formData.name,
                slug: state.formData.slug,
                description: state.formData.description,
            })
            state.channels = state.channels.map((c) => c.id === channelId ? updated : c)
            state.editing = null
            state.formData = {description: '', name: '', slug: ''}
            notifier.notify({level: 'success', message: 'Channel updated and synced with Galene'})
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update channel'
            notifier.notify({level: 'error', message})
        }
    }

    const handleDelete = async (channelId: number) => {
        if (!confirm('Are you sure you want to delete this channel? This will also delete the associated Galene group.')) return

        try {
            await api.delete(`/api/channels/${channelId}`)
            state.channels = state.channels.filter((c) => c.id !== channelId)
            notifier.notify({level: 'success', message: 'Channel deleted and Galene group removed'})
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete channel'
            notifier.notify({level: 'error', message})
        }
    }

    const handleSyncAll = async () => {
        state.syncing = true
        try {
            // Sync all channels by calling sync endpoint
            const response = await api.post('/api/channels/sync', {})
            const {success, failed} = response
            if (failed > 0) {
                notifier.notify({level: 'warning', message: `Synced ${success} channels, ${failed} failed`})
            } else {
                notifier.notify({level: 'success', message: `Successfully synced ${success} channels with Galene`})
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to sync channels'
            notifier.notify({level: 'error', message})
        } finally {
            state.syncing = false
        }
    }

    const startEdit = (channel: Channel) => {
        state.editing = channel.id
        state.formData = {
            description: channel.description || '',
            name: channel.name,
            slug: channel.slug,
        }
    }

    const cancelEdit = () => {
        state.editing = null
        state.formData = {description: '', name: '', slug: ''}
    }

    return (
        <section class="c-settings-tab-channels tab-content active">
            <div class="c-settings-tab-channels__header">
                <h2>Channel Configuration</h2>
                <div class="c-settings-tab-channels__header-actions">
                    <Button
                        icon="Sync"
                        label="Sync All with Galene"
                        onClick={handleSyncAll}
                        type="info"
                        disabled={state.syncing}
                    />
                    <Button
                        icon="Plus"
                        label="Create Channel"
                        onClick={handleCreate}
                        type="info"
                    />
                </div>
            </div>

            {state.loading ? (
                <div>Loading channels...</div>
            ) : (
                <>
                    {state.editing === null && (
                        <div class="c-settings-tab-channels__create-form">
                            <h3>Create New Channel</h3>
                            <div class="c-settings-tab-channels__form">
                                <FieldText
                                    model={state.$formData.name}
                                    label="Channel Name"
                                    placeholder="Enter channel name"
                                />
                                <FieldText
                                    model={state.$formData.slug}
                                    label="Slug (Galene Group Name)"
                                    placeholder="Enter slug (must match Galene group name)"
                                    help="This slug will be used as the Galene group name"
                                />
                                <FieldText
                                    model={state.$formData.description}
                                    label="Description"
                                    placeholder="Enter channel description"
                                />
                                <div class="c-settings-tab-channels__actions">
                                    <Button
                                        icon="Plus"
                                        label="Create Channel"
                                        onClick={handleCreate}
                                        type="success"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div class="c-settings-tab-channels__list">
                        {state.channels.map((channel) => (
                            <div key={channel.id} class="c-settings-tab-channels__item">
                                {state.editing === channel.id ? (
                                    <div class="c-settings-tab-channels__form">
                                        <FieldText
                                            model={state.$formData.name}
                                            label="Channel Name"
                                        />
                                        <FieldText
                                            model={state.$formData.slug}
                                            label="Slug (Galene Group Name)"
                                            help="This slug will be used as the Galene group name"
                                        />
                                        <FieldText
                                            model={state.$formData.description}
                                            label="Description"
                                        />
                                        <div class="c-settings-tab-channels__actions">
                                            <Button
                                                icon="Save"
                                                label="Save"
                                                onClick={() => handleUpdate(channel.id)}
                                                type="success"
                                            />
                                            <Button
                                                icon="Close"
                                                label="Cancel"
                                                onClick={cancelEdit}
                                                type="default"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div class="c-settings-tab-channels__content">
                                        <div>
                                            <h3>{channel.name}</h3>
                                            <p class="c-settings-tab-channels__slug">Slug: {channel.slug}</p>
                                            <p>{channel.description || 'No description'}</p>
                                        </div>
                                        <div class="c-settings-tab-channels__actions">
                                            <Button
                                                icon="Edit"
                                                onClick={() => startEdit(channel)}
                                                tip="Edit"
                                                variant="menu"
                                            />
                                            <Button
                                                icon="Trash"
                                                onClick={() => handleDelete(channel.id)}
                                                tip="Delete"
                                                type="danger"
                                                variant="menu"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {state.channels.length === 0 && (
                            <div class="c-settings-tab-channels__empty">
                                <p>No channels yet. Create your first channel above.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </section>
    )
}
