import {useRef} from 'preact/hooks'
import {deepSignal} from 'deepsignal'
import {api, notifier} from '@garage44/common/app'

export interface CollectionManagerConfig<TItem, TFormData> {
    /**
     * API endpoint for listing items (e.g., '/api/users')
     */
    listEndpoint: string
    /**
     * API endpoint for creating items (e.g., '/api/users' or a function that takes formData)
     */
    createEndpoint: string | ((formData: TFormData) => string)
    /**
     * Function to build the update endpoint URL (e.g., (id) => `/api/users/${id}`)
     */
    updateEndpoint: (id: string | number) => string
    /**
     * HTTP method for update (default: 'PUT', users API uses 'POST')
     */
    updateMethod?: 'PUT' | 'POST'
    /**
     * Function to build the delete endpoint URL (e.g., (id) => `/api/users/${id}/delete`)
     */
    deleteEndpoint: (id: string | number) => string
    /**
     * HTTP method for delete (default: 'DELETE', users API uses 'GET')
     */
    deleteMethod?: 'GET' | 'DELETE'
    /**
     * Function to get the ID from an item
     */
    getId: (item: TItem) => string | number
    /**
     * Initial form data
     */
    initialFormData: TFormData
    /**
     * Function to transform form data to API payload for create
     */
    transformCreateData: (formData: TFormData) => unknown
    /**
     * Function to transform form data to API payload for update
     */
    transformUpdateData: (formData: TFormData) => unknown
    /**
     * Function to populate form data from an item
     */
    populateFormData: (item: TItem) => TFormData
    /**
     * Success messages
     */
    messages?: {
        loadFailed?: string
        createSuccess?: string
        createFailed?: string
        updateSuccess?: string
        updateFailed?: string
        deleteSuccess?: string
        deleteFailed?: string
        deleteConfirm?: (item: TItem) => string
    }
}

export interface CollectionManagerState<TItem, TFormData> {
    items: TItem[]
    loading: boolean
    editing: string | number | null
    formData: TFormData
    error: string | null
}

/**
 * Generic collection management hook for CRUD operations
 * 
 * Provides a reusable pattern for managing collections with:
 * - Loading items from API
 * - Creating new items
 * - Updating existing items
 * - Deleting items
 * - Form state management
 * 
 * @example
 * const manager = useCollectionManager({
 *   listEndpoint: '/api/users',
 *   createEndpoint: '/api/users',
 *   updateEndpoint: (id) => `/api/users/${id}`,
 *   deleteEndpoint: (id) => `/api/users/${id}/delete`,
 *   getId: (user) => user.id,
 *   initialFormData: { username: '', password: '', admin: false },
 *   transformCreateData: (data) => ({ username: data.username, ... }),
 *   transformUpdateData: (data) => ({ username: data.username, ... }),
 *   populateFormData: (user) => ({ username: user.username, ... }),
 * })
 */
export function useCollectionManager<TItem, TFormData>(
    config: CollectionManagerConfig<TItem, TFormData>
) {
    const stateRef = useRef(deepSignal<CollectionManagerState<TItem, TFormData>>({
        items: [],
        loading: false,
        editing: null,
        formData: config.initialFormData,
        error: null,
    }))
    const state = stateRef.current

    const loadItems = async() => {
        state.loading = true
        state.error = null
        try {
            const data = await api.get(config.listEndpoint)
            state.items = Array.isArray(data) ? data : []
        } catch {
            state.error = config.messages?.loadFailed || 'Failed to load items'
            notifier.notify({
                level: 'error',
                message: state.error,
            })
        } finally {
            state.loading = false
        }
    }

    const createItem = async() => {
        try {
            state.loading = true
            state.error = null
            const payload = config.transformCreateData(state.formData)
            const endpoint = typeof config.createEndpoint === 'function' 
                ? config.createEndpoint(state.formData)
                : config.createEndpoint
            const newItem = await api.post(endpoint, payload) as TItem
            state.items = [...state.items, newItem]
            state.formData = config.initialFormData
            notifier.notify({
                level: 'success',
                message: config.messages?.createSuccess || 'Item created successfully',
            })
            return newItem
        } catch(error) {
            const message = error instanceof Error ? error.message : (config.messages?.createFailed || 'Failed to create item')
            state.error = message
            notifier.notify({
                level: 'error',
                message,
            })
            throw error
        } finally {
            state.loading = false
        }
    }

    const updateItem = async(itemId: string | number) => {
        try {
            state.loading = true
            state.error = null
            const payload = config.transformUpdateData(state.formData)
            const method = config.updateMethod || 'PUT'
            const updatedItem = method === 'POST' 
                ? await api.post(config.updateEndpoint(itemId), payload) as TItem
                : await api.put(config.updateEndpoint(itemId), payload) as TItem
            state.items = state.items.map((item) => 
                config.getId(item) === itemId ? updatedItem : item
            )
            state.editing = null
            state.formData = config.initialFormData
            notifier.notify({
                level: 'success',
                message: config.messages?.updateSuccess || 'Item updated successfully',
            })
            return updatedItem
        } catch(error) {
            const message = error instanceof Error ? error.message : (config.messages?.updateFailed || 'Failed to update item')
            state.error = message
            notifier.notify({
                level: 'error',
                message,
            })
            throw error
        } finally {
            state.loading = false
        }
    }

    const deleteItem = async(item: TItem) => {
        const itemId = config.getId(item)
        const confirmMessage = config.messages?.deleteConfirm 
            ? config.messages.deleteConfirm(item)
            : 'Are you sure you want to delete this item?'
        
        if (!confirm(confirmMessage)) {
            return
        }

        try {
            state.loading = true
            state.error = null
            const method = config.deleteMethod || 'DELETE'
            if (method === 'GET') {
                await api.get(config.deleteEndpoint(itemId))
            } else {
                await api.delete(config.deleteEndpoint(itemId))
            }
            state.items = state.items.filter((i) => config.getId(i) !== itemId)
            if (state.editing === itemId) {
                state.editing = null
                state.formData = config.initialFormData
            }
            notifier.notify({
                level: 'success',
                message: config.messages?.deleteSuccess || 'Item deleted successfully',
            })
        } catch(error) {
            const message = error instanceof Error ? error.message : (config.messages?.deleteFailed || 'Failed to delete item')
            state.error = message
            notifier.notify({
                level: 'error',
                message,
            })
            throw error
        } finally {
            state.loading = false
        }
    }

    const startEdit = (item: TItem) => {
        state.editing = config.getId(item)
        state.formData = config.populateFormData(item)
    }

    const cancelEdit = () => {
        state.editing = null
        state.formData = config.initialFormData
    }

    return {
        state,
        loadItems,
        createItem,
        updateItem,
        deleteItem,
        startEdit,
        cancelEdit,
    }
}
