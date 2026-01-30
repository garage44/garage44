import type {CommonState} from '@garage44/common/types'

export interface NonlinearState extends CommonState {
    agents: Array<{
        config: string
        created_at: number
        enabled: number
        id: string
        name: string
        type: 'prioritizer' | 'developer' | 'reviewer'
    }>
    repositories: Array<{
        config: string
        created_at: number
        id: string
        name: string
        path: string
        platform: 'github' | 'gitlab' | 'local'
        remote_url: string | null
        updated_at: number
    }>
    selectedLane: 'backlog' | 'todo' | 'in_progress' | 'review' | 'closed' | null
    selectedRepository: string | null
    selectedTicket: string | null
    tickets: Array<{
        assignee_id: string | null
        assignee_type: 'agent' | 'human' | null
        branch_name: string | null
        created_at: number
        description: string | null
        id: string
        merge_request_id: string | null
        priority: number | null
        repository_id: string
        repository_name: string | null
        status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'closed'
        title: string
        updated_at: number
    }>
}
