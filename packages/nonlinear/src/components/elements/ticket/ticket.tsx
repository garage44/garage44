import {$s} from '@/app'
import {AgentBadge} from '../agent-badge/agent-badge'
import {Icon} from '@garage44/common/components'
import {route} from 'preact-router'
import {useState} from 'preact/hooks'

interface TicketCardProps {
    ticket: {
        assignee_id: string | null
        assignee_type: string | null
        branch_name: string | null
        description: string | null
        id: string
        merge_request_id: string | null
        priority: number | null
        repository_name: string | null
        status: string
        title: string
    }
}

export const TicketCard = ({ticket}: TicketCardProps) => {
    const [expanded, _setExpanded] = useState(false)

    const getPriorityColor = (priority: number | null) => {
        if (!priority) return 'var(--surface-6)'
        if (priority >= 80) return 'var(--danger-6)'
        if (priority >= 60) return 'var(--warning-6)'
        return 'var(--primary-6)'
    }

    const handleClick = () => {
        route(`/tickets/${ticket.id}`)
    }

    return (
        <div class='c-ticket-card' onClick={handleClick}>
            <div class='header'>
                <h3 class='title'>{ticket.title}</h3>
                {ticket.priority !== null &&
                    <div
                        class='priority'
                        style={{color: getPriorityColor(ticket.priority)}}
                    >
                        P{ticket.priority}
                    </div>}
            </div>
            {ticket.repository_name &&
                <div class='repo'>
                    <Icon name='folder' size='d' type='info' />
                    <span>{ticket.repository_name}</span>
                </div>}
            {ticket.assignee_id &&
                (() => {
                    if (ticket.assignee_type === 'agent') {
                        const agent = $s.agents.find((a) => a.id === ticket.assignee_id || a.name === ticket.assignee_id)
                        if (agent) {
                            return (
                                <div class='assignee'>
                                    <AgentBadge agent={agent} size='s' />
                                </div>
                            )
                        }
                    }
                    return (
                        <div class='assignee'>
                            <Icon name='person' size='d' type='info' />
                            <span>{ticket.assignee_type === 'agent' ? '🤖' : '👤'} {ticket.assignee_id}</span>
                        </div>
                    )
                })()}
            {ticket.branch_name &&
                <div class='branch'>
                    <Icon name='code' size='d' type='info' />
                    <span>{ticket.branch_name}</span>
                </div>}
            {expanded && ticket.description &&
                <div class='description'>
                    {ticket.description}
                </div>}
            {expanded && ticket.merge_request_id &&
                <div class='mr'>
                    <a href={`#mr-${ticket.merge_request_id}`} rel='noopener noreferrer' target='_blank'>
                        View MR #{ticket.merge_request_id}
                    </a>
                </div>}
        </div>
    )
}
