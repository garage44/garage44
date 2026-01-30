import {
    persistentState as commonPersistantState,
    volatileState as commonVolatileState,
} from '@garage44/common/lib/state'
import {mergeDeep} from '@garage44/common/lib/utils'

// Use const assertions for the state objects
const persistantState = mergeDeep({
    panels: {
        context: {
            collapsed: false,
            width: 600,
        },
    },
}, commonPersistantState)

const volatileState = mergeDeep({
    tickets: [] as Array<{
        id: string
        repository_id: string
        title: string
        description: string | null
        status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'closed'
        priority: number | null
        assignee_type: 'agent' | 'human' | null
        assignee_id: string | null
        branch_name: string | null
        merge_request_id: string | null
        created_at: number
        updated_at: number
        repository_name: string | null
    }>,
    repositories: [] as Array<{
        id: string
        name: string
        path: string
        platform: 'github' | 'gitlab' | 'local'
        remote_url: string | null
        config: string
        created_at: number
        updated_at: number
    }>,
    agents: [] as Array<{
        id: string
        name: string
        type: 'prioritizer' | 'developer' | 'reviewer'
        config: string
        enabled: number
        created_at: number
    }>,
    selectedRepository: null as string | null,
    selectedTicket: null as string | null,
    selectedLane: null as 'backlog' | 'todo' | 'in_progress' | 'review' | 'closed' | null,
}, commonVolatileState)

export {
    persistantState,
    volatileState,
}
