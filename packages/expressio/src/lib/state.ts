import {
    CommonState,
    persistentState as commonPersistantState,
    volatileState as commonVolatileState,
} from '@garage44/common/lib/state'
import {Workspace, WorkspaceDescription} from '../types.ts'
import {EnolaConfig} from '@garage44/enola/types'
import {mergeDeep} from '@garage44/common/lib/utils'
import type {DeepSignal} from 'deepsignal'

export interface ExpressioState extends CommonState {
    enola: EnolaConfig
    /** Keeps track which tags have been updated for visual feedback */
    tags: {
        updated: string
    }
    workspace: Workspace
    workspaces: DeepSignal<[WorkspaceDescription]>
}

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
    tags: {
        updated: false,
    },
    workspace: null,
    workspaces: [],
}, commonVolatileState)
