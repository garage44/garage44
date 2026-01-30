import {$s} from '@/app'
import {ws, notifier} from '@garage44/common/app'
import {Button, Icon} from '@garage44/common/components'
import {deepSignal} from 'deepsignal'
import {useEffect, useState} from 'preact/hooks'
import {route} from 'preact-router'

const commentState = deepSignal({
    content: '',
})

interface TicketDetailProps {
    ticketId?: string
}

interface Ticket {
    description: string | null
    id: string
    status: string
    title: string
}

interface Comment {
    author_id: string
    author_type: 'agent' | 'human'
    content: string
    created_at: number
    id: string
}

export const TicketDetail = ({ticketId}: TicketDetailProps) => {
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!ticketId) {
            const id = $s.selectedTicket || route().split('/').pop()
            if (!id) {
                route('/board')
                return
            }
            loadTicket(id)
        } else {
            loadTicket(ticketId)
        }
    }, [ticketId])

    const loadTicket = async(id: string) => {
        setLoading(true)
        try {
            const result = await ws.get(`/api/tickets/${id}`)
            if (result.ticket) {
                setTicket(result.ticket)
            }
            if (result.comments) {
                setComments(result.comments)
            }
        } catch(error) {
            notifier.notify({
                message: `Failed to load ticket: ${error instanceof Error ? error.message : String(error)}`,
                type: 'error',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAddComment = async() => {
        if (!commentState.content.trim() || !ticket) return

        // Extract @mentions from comment
        const mentionRegex = /@(\w+)/g
        const mentions: string[] = []
        let match
        while ((match = mentionRegex.exec(commentState.content)) !== null) {
            mentions.push(match[1])
        }

        try {
            await ws.post(`/api/tickets/${ticket.id}/comments`, {
                author_id: $s.profile.username || 'user',
                author_type: 'human',
                content: commentState.content,
                mentions: mentions.length > 0 ? mentions : undefined,
            })

            commentState.content = ''
            await loadTicket(ticket.id)

            notifier.notify({
                message: 'Comment added',
                type: 'success',
            })
        } catch(error) {
            notifier.notify({
                message: `Failed to add comment: ${error instanceof Error ? error.message : String(error)}`,
                type: 'error',
            })
        }
    }

    const handleApprove = async() => {
        if (!ticket) return

        try {
            await ws.put(`/api/tickets/${ticket.id}`, {
                status: 'closed',
            })

            notifier.notify({
                message: 'Ticket approved and closed',
                type: 'success',
            })

            route('/board')
        } catch(error) {
            notifier.notify({
                message: `Failed to approve ticket: ${error instanceof Error ? error.message : String(error)}`,
                type: 'error',
            })
        }
    }

    const handleReopen = async() => {
        if (!ticket) return

        const reason = prompt('Why are you reopening this ticket?')
        if (!reason) return

        try {
            // Add comment explaining the reopen
            await ws.post(`/api/tickets/${ticket.id}/comments`, {
                author_id: $s.profile.username || 'user',
                author_type: 'human',
                content: `Reopening ticket: ${reason}`,
            })

            // Move back to in_progress
            await ws.put(`/api/tickets/${ticket.id}`, {
                assignee_id: null,
                assignee_type: null,
                status: 'in_progress',
            })

            notifier.notify({
                message: 'Ticket reopened',
                type: 'success',
            })

            await loadTicket(ticket.id)
        } catch(error) {
            notifier.notify({
                message: `Failed to reopen ticket: ${error instanceof Error ? error.message : String(error)}`,
                type: 'error',
            })
        }
    }

    const handleAssignAgent = async(agentName: string) => {
        if (!ticket) return

        try {
            await ws.put(`/api/tickets/${ticket.id}`, {
                assignee_id: agentName,
                assignee_type: 'agent',
            })

            notifier.notify({
                message: `Ticket assigned to agent: ${agentName}`,
                type: 'success',
            })

            await loadTicket(ticket.id)
        } catch(error) {
            notifier.notify({
                message: `Failed to assign agent: ${error instanceof Error ? error.message : String(error)}`,
                type: 'error',
            })
        }
    }

    if (loading) {
        return <div class='c-ticket-detail'>Loading...</div>
    }

    if (!ticket) {
        return <div class='c-ticket-detail'>Ticket not found</div>
    }

    // Parse mentions from comments
    const parseMentions = (content: string) => {
        const parts: Array<{isMention: boolean; mention?: string; text: string}> = []
        const mentionRegex = /@(\w+)/g
        let lastIndex = 0
        let match

        while ((match = mentionRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push({isMention: false, text: content.substring(lastIndex, match.index)})
            }
            parts.push({isMention: true, mention: match[1], text: `@${match[1]}`})
            lastIndex = match.index + match[0].length
        }

        if (lastIndex < content.length) {
            parts.push({isMention: false, text: content.substring(lastIndex)})
        }

        return parts.length > 0 ? parts : [{isMention: false, text: content}]
    }

    return (
        <div class='c-ticket-detail'>
            <div class='c-ticket-detail__header'>
                <Button onClick={() => route('/board')} variant='ghost'>
                    <Icon name='arrow_back' size='c' type='info' />
                    Back to Board
                </Button>
                <h1>{ticket.title}</h1>
                <div class='c-ticket-detail__status'>
                    Status: <span class={`status-${ticket.status}`}>{ticket.status}</span>
                </div>
            </div>

            <div class='c-ticket-detail__content'>
                <div class='c-ticket-detail__description'>
                    <h2>Description</h2>
                    <p>{ticket.description || 'No description provided'}</p>
                </div>

                {ticket.status === 'closed' &&
                    <div class='c-ticket-detail__actions'>
                        <Button onClick={handleApprove} variant='primary'>
                            Approve & Close
                        </Button>
                        <Button onClick={handleReopen} variant='secondary'>
                            Reopen
                        </Button>
                    </div>}

                <div class='c-ticket-detail__comments'>
                    <h2>Comments</h2>
                    {comments.length === 0 ?

                            <p class='c-ticket-detail__no-comments'>No comments yet</p> :

                            <div class='c-ticket-detail__comments-list'>
                                {comments.map((comment) => {
                                    const parts = parseMentions(comment.content)
                                    return (
                                        <div class='c-ticket-detail__comment' key={comment.id}>
                                            <div class='c-ticket-detail__comment-header'>
                                                <strong>
                                                    {comment.author_type === 'agent' ? '🤖' : '👤'} {comment.author_id}
                                                </strong>
                                                <span class='c-ticket-detail__comment-time'>
                                                    {new Date(comment.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div class='c-ticket-detail__comment-content'>
                                                {parts.map((part, idx) => {
                                                    return part.isMention ?
                                                        <span
                                                            class='c-ticket-detail__mention'
                                                            key={idx}
                                                            onClick={() => handleAssignAgent(part.mention!)}
                                                        >
                                                            {part.text}
                                                        </span> :
                                                        <span key={idx}>{part.text}</span>
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>}

                    <div class='c-ticket-detail__add-comment'>
                        <textarea
                            class='c-ticket-detail__comment-input'
                            onInput={(e) => {
                                commentState.content = (e.target as HTMLTextAreaElement).value
                            }}
                            placeholder='Type your comment... Use @agent-name or @human to mention'
                            rows={4}
                            value={commentState.content}
                        />
                        <Button disabled={!commentState.content.trim()} onClick={handleAddComment}>
                            Add Comment
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
