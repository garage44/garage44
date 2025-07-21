import {
    CommonState,
    persistentState as commonPersistantState,
    volatileState as commonVolatileState,
} from '@garage44/common/lib/state'
import type {Workspace, WorkspaceDescription} from '../types.ts'
import {EnolaConfig} from '@garage44/enola/types'
import {mergeDeep} from '@garage44/common/lib/utils'
import type {DeepSignal} from 'deepsignal'

export interface ExpressioStateBase extends CommonState {
    enola: EnolaConfig
    filter: string
    sort: 'asc' | 'desc'
    /** Keeps track which tags have been updated for visual feedback */
    tags: {
        updated: string
    }
    workspace: Workspace
    workspaces: DeepSignal<[WorkspaceDescription]>
}

export type ExpressioState = DeepSignal<ExpressioStateBase>

// Use const assertions for the state objects
export const persistantState = mergeDeep({}, commonPersistantState)

export const volatileState = mergeDeep({
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
