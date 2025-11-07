import {FieldText, FieldSelect, Button} from '@garage44/common/components'
import {useEffect, useState} from 'preact/hooks'
import {$s} from '@/app'
import {$t, api, notifier} from '@garage44/common/app'
import type {Channel} from '@/types'
import './channels.css'

export default function TabChannels() {
    const [channels, setChannels] = useState<Channel[]>([])
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState<number | null>(null)
    const [formData, setFormData] = useState<{name: string; description: string}>({
        name: '',
        description: '',
    })

    const loadChannels = async () => {
        setLoading(true)
        try {
            const data = await api.get('/api/channels')
            setChannels(Array.isArray(data) ? data : [])
        } catch (error) {
            notifier.notify({level: 'error', message: 'Failed to load channels'})
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadChannels()
    }, [])

    const handleCreate = async () => {
        try {
            const newChannel = await api.post('/api/channels', formData)
            setChannels([...channels, newChannel])
            setFormData({name: '', description: ''})
            notifier.notify({level: 'success', message: 'Channel created'})
        } catch (error) {
            notifier.notify({level: 'error', message: 'Failed to create channel'})
        }
    }

    const handleUpdate = async (channelId: number) => {
        try {
            const updated = await api.put(`/api/channels/${channelId}`, formData)
            setChannels(channels.map((c) => c.id === channelId ? updated : c))
            setEditing(null)
            setFormData({name: '', description: ''})
            notifier.notify({level: 'success', message: 'Channel updated'})
        } catch (error) {
            notifier.notify({level: 'error', message: 'Failed to update channel'})
        }
    }

    const handleDelete = async (channelId: number) => {
        if (!confirm('Are you sure you want to delete this channel?')) return

        try {
            await api.delete(`/api/channels/${channelId}`)
            setChannels(channels.filter((c) => c.id !== channelId))
            notifier.notify({level: 'success', message: 'Channel deleted'})
        } catch (error) {
            notifier.notify({level: 'error', message: 'Failed to delete channel'})
        }
    }

    const startEdit = (channel: Channel) => {
        setEditing(channel.id)
        setFormData({
            name: channel.name,
            description: channel.description || '',
        })
    }

    const cancelEdit = () => {
        setEditing(null)
        setFormData({name: '', description: ''})
    }

    return (
        <section class="c-settings-tab-channels tab-content active">
            <div class="c-settings-tab-channels__header">
                <h2>Channel Configuration</h2>
                <Button
                    icon="Plus"
                    label="Create Channel"
                    onClick={handleCreate}
                    type="info"
                />
            </div>

            {loading ? (
                <div>Loading channels...</div>
            ) : (
                <div class="c-settings-tab-channels__list">
                    {channels.map((channel) => (
                        <div key={channel.id} class="c-settings-tab-channels__item">
                            {editing === channel.id ? (
                                <div class="c-settings-tab-channels__form">
                                    <FieldText
                                        value={formData.name}
                                        onChange={(value) => setFormData({...formData, name: value})}
                                        label="Channel Name"
                                    />
                                    <FieldText
                                        value={formData.description}
                                        onChange={(value) => setFormData({...formData, description: value})}
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
                </div>
            )}
        </section>
    )
}
