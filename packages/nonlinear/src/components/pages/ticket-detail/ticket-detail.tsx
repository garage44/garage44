import {$s} from '@/app'
import {ws, notifier} from '@garage44/common/app'
import {AgentBadge} from '@/components/elements'
import {Button, FieldSelect, FieldText, FieldTextarea, Icon} from '@garage44/common/components'
import {deepSignal} from 'deepsignal'
import {useEffect, useRef, useState} from 'preact/hooks'
import {route} from 'preact-router'

const commentState = deepSignal({
    content: '',
})

const createEditState = () => deepSignal({
    description: '',
    title: '',
})

const createAssigneeState = () => deepSignal({
    assignee_id: '',
    assignee_type: '' as '' | 'agent' | 'human',
})

interface TicketDetailProps {
    ticketId?: string
}

interface Ticket {
    assignee_id: string | null
    assignee_type: 'agent' | 'human' | null
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
    const [isEditing, setIsEditing] = useState(false)
    const editStateRef = useRef(createEditState())
    const editState = editStateRef.current
    const assigneeStateRef = useRef(createAssigneeState())
    const assigneeState = assigneeStateRef.current

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

        // Listen for comment updates
        const handleCommentUpdate = (data: {type: string; comment?: Comment; ticketId?: string}) => {
            if (data.type === 'comment:created' && data.comment) {
                const currentTicketId = ticketId || $s.selectedTicket || route().split('/').pop()
                if (data.ticketId === currentTicketId) {
                    // Reload ticket to get updated comments
                    loadTicket(currentTicketId || '')
                }
            }
        }

        ws.on('/tickets', handleCommentUpdate)

        return () => {
            ws.off('/tickets', handleCommentUpdate)
        }
    }, [ticketId])

    const loadTicket = async(id: string) => {
        setLoading(true)
        try {
            const result = await ws.get(`/api/tickets/${id}`)
            if (result.ticket) {
                setTicket(result.ticket)
                // Update edit state when ticket loads
                editState.title = result.ticket.title
                editState.description = result.ticket.description || ''
                // Update assignee state
                assigneeState.assignee_type = result.ticket.assignee_type || ''
                assigneeState.assignee_id = result.ticket.assignee_id || ''
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
            await ws.post(`/api/tickets/${ticket.id}/approve`, {})

            notifier.notify({
                message: 'Ticket approved',
                type: 'success',
            })

            await loadTicket(ticket.id)
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
            await ws.post(`/api/tickets/${ticket.id}/reopen`, {
                reason,
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

    const handleAssigneeChange = async() => {
        if (!ticket) return

        try {
            const updates: {
                assignee_id?: string | null
                assignee_type?: 'agent' | 'human' | null
            } = {}

            if (assigneeState.assignee_type) {
                updates.assignee_type = assigneeState.assignee_type
                updates.assignee_id = assigneeState.assignee_id || null
            } else {
                updates.assignee_type = null
                updates.assignee_id = null
            }

            await ws.put(`/api/tickets/${ticket.id}`, updates)

            // If assigned to PrioritizerAgent, trigger refinement
            if (assigneeState.assignee_type === 'agent' && assigneeState.assignee_id) {
                const agent = $s.agents.find((a) => a.id === assigneeState.assignee_id || a.name === assigneeState.assignee_id)
                if (agent && agent.type === 'prioritizer') {
                    try {
                        await ws.post(`/api/agents/${agent.id}/trigger`, {
                            ticket_id: ticket.id,
                        })
                        notifier.notify({
                            message: 'Ticket assigned to PrioritizerAgent. Refinement will begin shortly.',
                            type: 'success',
                        })
                    } catch(error) {
                        // Assignment succeeded but refinement trigger failed
                        notifier.notify({
                            message: 'Ticket assigned, but failed to trigger refinement',
                            type: 'warn',
                        })
                    }
                } else {
                    notifier.notify({
                        message: `Ticket assigned to ${agent?.name || assigneeState.assignee_id}`,
                        type: 'success',
                    })
                }
            } else {
                notifier.notify({
                    message: 'Assignment updated',
                    type: 'success',
                })
            }

            await loadTicket(ticket.id)
        } catch(error) {
            notifier.notify({
                message: `Failed to update assignment: ${error instanceof Error ? error.message : String(error)}`,
                type: 'error',
            })
        }
    }

    const getAssigneeOptions = () => {
        if (assigneeState.assignee_type === 'agent') {
            return $s.agents
                .filter((agent) => agent.enabled === 1)
                .map((agent) => ({
                    id: agent.id,
                    name: `${agent.displayName || agent.name || 'Unknown'} (${agent.type})`,
                }))
        }
        if (assigneeState.assignee_type === 'human') {
            // For now, return empty - would need user list
            return []
        }
        return []
    }

    const handleSaveEdit = async() => {
        if (!ticket) return

        try {
            await ws.put(`/api/tickets/${ticket.id}`, {
                title: editState.title,
                description: editState.description || null,
            })

            notifier.notify({
                message: 'Ticket updated',
                type: 'success',
            })

            setIsEditing(false)
            await loadTicket(ticket.id)
        } catch(error) {
            notifier.notify({
                message: `Failed to update ticket: ${error instanceof Error ? error.message : String(error)}`,
                type: 'error',
            })
        }
    }

    const handleCancelEdit = () => {
        if (ticket) {
            editState.title = ticket.title
            editState.description = ticket.description || ''
        }
        setIsEditing(false)
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
            <div class='header'>
                <div class='back-button'>
                    <Button onClick={() => route('/board')} variant='ghost'>
                        <Icon name='arrow_back' size='c' type='info' />
                        Back to Board
                    </Button>
                </div>
                {isEditing ?
                    <div class='edit-title'>
                        <FieldText
                            autofocus
                            model={editState.$title}
                            placeholder='Enter ticket title'
                        />
                    </div> :
                    <div class='title-row'>
                        <h1>{ticket.title}</h1>
                        <Button onClick={() => setIsEditing(true)} variant='ghost'>
                            <Icon name='edit' size='c' type='info' />
                            Edit
                        </Button>
                    </div>}
                <div class='status'>
                    <span class={`status-badge status-${ticket.status}`}>{ticket.status}</span>
                </div>
            </div>

            <div class='content'>
                <div class='assignee-section'>
                    <h2>Assignee</h2>
                    <div class='assignee-fields'>
                        <FieldSelect
                            label='Assignee Type'
                            model={assigneeState.$assignee_type}
                            onChange={() => {
                                // Reset assignee_id when type changes
                                assigneeState.assignee_id = ''
                                // If set to None, immediately save
                                if (!assigneeState.assignee_type) {
                                    handleAssigneeChange()
                                }
                            }}
                            options={[
                                {id: '', name: 'None'},
                                {id: 'agent', name: 'Agent'},
                                {id: 'human', name: 'Human'},
                            ]}
                            placeholder='Select assignee type'
                        />
                        {assigneeState.assignee_type &&
                            <FieldSelect
                                label='Assignee'
                                model={assigneeState.$assignee_id}
                                onChange={handleAssigneeChange}
                                options={getAssigneeOptions()}
                                placeholder='Select assignee'
                            />}
                        {ticket.assignee_id && ticket.assignee_type === 'agent' &&
                            (() => {
                                const agent = $s.agents.find((a) => a.id === ticket.assignee_id || a.name === ticket.assignee_id)
                                return agent ?
                                    <div class='current-assignee'>
                                        <AgentBadge agent={agent} size='d' />
                                    </div> :
                                    null
                            })()}
                    </div>
                </div>

                <div class='description'>
                    <h2>Description</h2>
                    {isEditing ?
                        <div class='edit-description'>
                            <FieldTextarea
                                onChange={(value) => {
                                    editState.description = value
                                }}
                                placeholder='Enter ticket description'
                                value={editState.description}
                            />
                            <div class='edit-actions'>
                                <Button onClick={handleSaveEdit} variant='primary'>
                                    Save
                                </Button>
                                <Button onClick={handleCancelEdit} variant='ghost'>
                                    Cancel
                                </Button>
                            </div>
                        </div> :
                        <p>{ticket.description || 'No description provided'}</p>}
                </div>

                {ticket.status === 'closed' &&
                    <div class='actions'>
                        <Button onClick={handleApprove} variant='primary'>
                            Approve & Close
                        </Button>
                        <Button onClick={handleReopen} variant='secondary'>
                            Reopen
                        </Button>
                    </div>}

                <div class='comments'>
                    <h2>Comments</h2>
                    {comments.length === 0 ?

                            <p class='no-comments'>No comments yet</p> :

                            <div class='comments-list'>
                                {comments.map((comment) => {
                                    const parts = parseMentions(comment.content)
                                    return (
                                        <div class='comment' key={comment.id}>
                                            <div class='comment-header'>
                                                {comment.author_type === 'agent' ?
                                                    (() => {
                                                        const agent = $s.agents.find((a) => a.id === comment.author_id || a.name === comment.author_id)
                                                        return agent ?
                                                            <AgentBadge agent={agent} size='d' /> :
                                                            <strong>🤖 {comment.author_id}</strong>
                                                    })() :
                                                    <strong>👤 {comment.author_id}</strong>}
                                                <span class='comment-time'>
                                                    {new Date(comment.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div class='comment-content'>
                                                {parts.map((part, idx) => {
                                                    return part.isMention ?
                                                        <span
                                                            class='mention'
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

                    <div class='add-comment'>
                        <textarea
                            class='comment-input'
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
