import {$s} from '@/app'
import {ws} from '@garage44/common/app'
import {Icon} from '@garage44/common/components'
import {route} from 'preact-router'
import {useState} from 'preact/hooks'

interface TicketCardProps {
    ticket: {
        id: string
        title: string
        description: string | null
        status: string
        priority: number | null
        assignee_type: string | null
        assignee_id: string | null
        branch_name: string | null
        merge_request_id: string | null
        repository_name: string | null
    }
}

export const TicketCard = ({ticket}: TicketCardProps) => {
    const [expanded, setExpanded] = useState(false)

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
            <div class='c-ticket-card__header'>
                <h3 class='c-ticket-card__title'>{ticket.title}</h3>
                {ticket.priority !== null && (
                    <div
                        class='c-ticket-card__priority'
                        style={{color: getPriorityColor(ticket.priority)}}
                    >
                        P{ticket.priority}
                    </div>
                )}
            </div>
            {ticket.repository_name && (
                <div class='c-ticket-card__repo'>
                    <Icon name='folder' size='d' type='info' />
                    <span>{ticket.repository_name}</span>
                </div>
            )}
            {ticket.assignee_id && (
                <div class='c-ticket-card__assignee'>
                    <Icon name='person' size='d' type='info' />
                    <span>{ticket.assignee_type === 'agent' ? '🤖' : '👤'} {ticket.assignee_id}</span>
                </div>
            )}
            {ticket.branch_name && (
                <div class='c-ticket-card__branch'>
                    <Icon name='code' size='d' type='info' />
                    <span>{ticket.branch_name}</span>
                </div>
            )}
            {expanded && ticket.description && (
                <div class='c-ticket-card__description'>
                    {ticket.description}
                </div>
            )}
            {expanded && ticket.merge_request_id && (
                <div class='c-ticket-card__mr'>
                    <a href={`#mr-${ticket.merge_request_id}`} target='_blank' rel='noopener noreferrer'>
                        View MR #{ticket.merge_request_id}
                    </a>
                </div>
            )}
        </div>
    )
}
