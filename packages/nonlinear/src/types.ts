import type {CommonState} from '@garage44/common/types'

export interface NonlinearState extends CommonState {
    tickets: Array<{
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
    }>
    repositories: Array<{
        id: string
        name: string
        path: string
        platform: 'github' | 'gitlab' | 'local'
        remote_url: string | null
        config: string
        created_at: number
        updated_at: number
    }>
    agents: Array<{
        id: string
        name: string
        type: 'prioritizer' | 'developer' | 'reviewer'
        config: string
        enabled: number
        created_at: number
    }>
    selectedRepository: string | null
    selectedTicket: string | null
}
