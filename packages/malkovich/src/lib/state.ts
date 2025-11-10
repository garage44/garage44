import {
    persistentState as commonPersistantState,
    volatileState as commonVolatileState,
} from '@garage44/common/lib/state'
import {mergeDeep} from '@garage44/common/lib/utils'

const persistantState = mergeDeep({}, commonPersistantState)

const volatileState = mergeDeep({
    currentRoute: '/components',
    env: {},
    selectedComponent: null,
}, commonVolatileState)

export {persistantState, volatileState}