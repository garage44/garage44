import {
    persistentState as commonPersistantState,
    volatileState as commonVolatileState,
} from '@garage44/common/lib/state'
import {mergeDeep} from '@garage44/common/lib/utils'

// Use const assertions for the state objects
const persistantState = mergeDeep({}, commonPersistantState)

const volatileState = mergeDeep({
    enola: {
        engines: {},
        languages: {
            source: [],
            target: [],
        },
    },
    filter: '',
    sort: 'asc' as 'asc' | 'desc',
    tags: {
        updated: false,
    },
    workspace: null,
    workspaces: [],
}, commonVolatileState)

export {
    persistantState,
    volatileState,
}