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
    language_ui: {
        /** Stores the calls to i18next.t, allowing to reactively update $t */
        i18n: {} as Record<string, Record<string, string>>,
        options: [
            {id: 'ara', name: 'Arabic'},
            {id: 'zho', name: 'Chinese (Simplified)'},
            {id: 'nld', name: 'Dutch'},
            {id: 'eng-gbr', name: 'English'},
            {id: 'fra', name: 'French'},
            {id: 'deu', name: 'German'},
        ],
    },
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