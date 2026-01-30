import {$s} from '@/app'
import {ws} from '@garage44/common/app'
import {Button} from '@garage44/common/components'
import {TicketCard} from '@/components/elements/ticket/ticket'
import {useEffect} from 'preact/hooks'

const LANES = [
    {id: 'backlog', label: 'Backlog'},
    {id: 'todo', label: 'Todo'},
    {id: 'in_progress', label: 'In Progress'},
    {id: 'review', label: 'Review'},
    {id: 'closed', label: 'Closed'},
] as const

const handleDragStart = (e: DragEvent, ticketId: string) => {
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', ticketId)
    }
}

const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move'
    }
    // Add visual feedback for drag over
    const target = e.currentTarget as HTMLElement
    if (target) {
        target.classList.add('drag-over')
    }
}

const handleDragLeave = (e: DragEvent) => {
    const target = e.currentTarget as HTMLElement
    if (target) {
        target.classList.remove('drag-over')
    }
}

export const Board = () => {
    useEffect(() => {
        // Load tickets on mount
        (async() => {
            const result = await ws.get('/api/tickets')
            if (result.tickets) {
                $s.tickets = result.tickets
            }
        })()
    }, [])

    const handleAddTicket = (laneId: 'backlog' | 'todo' | 'in_progress' | 'review' | 'closed') => {
        $s.selectedLane = laneId
        if ($s.panels.context.collapsed) {
            $s.panels.context.collapsed = false
        }
    }

    const getTicketsForLane = (status: string) => {
        return $s.tickets.filter((ticket) => ticket.status === status)
    }

    const handleDrop = async(e: DragEvent, targetStatus: string) => {
        e.preventDefault()
        const target = e.currentTarget as HTMLElement
        if (target) {
            target.classList.remove('drag-over')
        }
        const ticketId = e.dataTransfer?.getData('text/plain')
        if (!ticketId) return

        try {
            // Update ticket status optimistically for immediate UI feedback
            const ticketIndex = $s.tickets.findIndex((t) => t.id === ticketId)
            if (ticketIndex >= 0) {
                // Create new array for DeepSignal reactivity
                const updatedTickets = [...$s.tickets]
                updatedTickets[ticketIndex] = {
                    ...updatedTickets[ticketIndex],
                    status: targetStatus as typeof updatedTickets[number]['status'],
                }
                $s.tickets = updatedTickets
            }

            // Update ticket status via API
            await ws.put(`/api/tickets/${ticketId}`, {
                status: targetStatus,
            })
            // WebSocket broadcast will update state with server response
        } catch(error) {
            // Revert optimistic update on error
            const result = await ws.get('/api/tickets')
            if (result.tickets) {
                $s.tickets = result.tickets
            }
            console.error('Failed to update ticket status:', error)
        }
    }

    return (
        <div class='c-board'>
            <div class='header'>
                <h1>Kanban Board</h1>
            </div>
            <div class='lanes'>
                {LANES.map((lane) => {
                    const tickets = getTicketsForLane(lane.id)
                    return (
                        <div
                            class='lane'
                            data-lane={lane.id}
                            key={lane.id}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, lane.id)}
                        >
                            <div class='lane-header'>
                                <h2>{lane.label}</h2>
                                <div class='lane-header-right'>
                                    <span class='lane-count'>{tickets.length}</span>
                                    <Button
                                        icon='add'
                                        onClick={() => handleAddTicket(lane.id)}
                                        size='s'
                                        tip={`Add ticket to ${lane.label}`}
                                        type='info'
                                        variant='toggle'
                                    />
                                </div>
                            </div>
                            <div class='lane-content'>
                                {tickets.length === 0 ?

                                            <div class='lane-empty'>
                                                No tickets
                                            </div> :

                                        tickets.map((ticket) => <div
                                            draggable
                                            key={ticket.id}
                                            onDragStart={(e) => handleDragStart(e, ticket.id)}
                                        >
                                                <TicketCard ticket={ticket} />
                                        </div>)}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
