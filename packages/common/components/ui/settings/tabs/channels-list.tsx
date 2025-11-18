import {useEffect} from 'preact/hooks'
import {route} from 'preact-router'
import {CollectionView, Button} from '@/components'
import {useCollectionManager} from '@garage44/common/lib/collection-manager'
import type {CollectionColumn} from '@/components/ui/collection-view/collection-view'

export interface Channel {
    created_at: number
    description: string
    id: number
    member_count?: number
    name: string
    slug: string
    unread_count?: number
}

export interface ChannelsListProps {
    /**
     * Translation function
     */
    $t?: (key: string) => string
}

/**
 * Channels List Component - Displays channels in a CollectionView table
 */
export function ChannelsList({
    $t = (key: string) => key,
}: ChannelsListProps) {
    const manager = useCollectionManager<Channel, {name: string; slug: string; description: string}>({
        listEndpoint: '/api/channels',
        createEndpoint: '/api/channels',
        updateEndpoint: (id) => `/api/channels/${id}`,
        updateMethod: 'PUT',
        deleteEndpoint: (id) => `/api/channels/${id}`,
        getId: (channel) => channel.id,
        initialFormData: {name: '', slug: '', description: ''},
        transformCreateData: (data) => ({
            description: data.description,
            name: data.name,
            slug: data.slug,
        }),
        transformUpdateData: (data) => ({
            description: data.description,
            name: data.name,
            slug: data.slug,
        }),
        populateFormData: (channel) => ({
            description: channel.description || '',
            name: channel.name,
            slug: channel.slug,
        }),
        messages: {
            loadFailed: $t('channel.management.error.load_failed') || 'Failed to load channels',
            createSuccess: $t('channel.management.success.created') || 'Channel created and synced with Galene',
            createFailed: $t('channel.management.error.create_failed') || 'Failed to create channel',
            updateSuccess: $t('channel.management.success.updated') || 'Channel updated and synced with Galene',
            updateFailed: $t('channel.management.error.update_failed') || 'Failed to update channel',
            deleteSuccess: $t('channel.management.success.deleted') || 'Channel deleted and Galene group removed',
            deleteFailed: $t('channel.management.error.delete_failed') || 'Failed to delete channel',
            deleteConfirm: (channel) => $t('channel.management.confirm.delete') || 'Are you sure you want to delete this channel? This will also delete the associated Galene group.',
        },
    })

    useEffect(() => {
        manager.loadItems()
    }, [])

    const columns: CollectionColumn[] = [
        {
            label: $t('channel.management.field.name') || 'Name',
            flex: true,
            minWidth: '200px',
            render: (channel: Channel) => (
                <div>
                    <strong>{channel.name}</strong>
                </div>
            ),
        },
        {
            label: $t('channel.management.field.slug') || 'Slug',
            flex: true,
            minWidth: '150px',
            render: (channel: Channel) => (
                <span style={{color: 'var(--text-2)', fontFamily: 'monospace'}}>
                    {channel.slug}
                </span>
            ),
        },
        {
            label: $t('channel.management.field.description') || 'Description',
            flex: 2,
            minWidth: '200px',
            render: (channel: Channel) => (
                <span style={{color: 'var(--text-2)'}}>
                    {channel.description || '—'}
                </span>
            ),
        },
    ]

    return (
        <section class="c-channels-list">
            <div class="header">
                <h2>{$t('ui.settings.channels.name') || 'Channels'}</h2>
                <Button
                    icon="plus"
                    label={$t('channel.management.action.add_channel') || 'Add Channel'}
                    onClick={() => route('/settings/channels/new')}
                    type="success"
                />
            </div>

            {manager.state.loading ? (
                <div>Loading channels...</div>
            ) : (
                <CollectionView
                    columns={columns}
                    emptyMessage={$t('channel.management.empty') || 'No channels found. Click "Add Channel" to create one.'}
                    items={manager.state.items}
                    row_actions={(channel: Channel) => (
                        <>
                            <Button
                                icon="edit"
                                onClick={() => route(`/settings/channels/${channel.id}`)}
                                tip={$t('channel.management.action.edit') || 'Edit'}
                                type="info"
                                variant="toggle"
                            />
                            <Button
                                icon="trash"
                                onClick={() => manager.deleteItem(channel)}
                                tip={$t('channel.management.action.delete') || 'Delete'}
                                type="danger"
                                variant="toggle"
                            />
                        </>
                    )}
                />
            )}
        </section>
    )
}
