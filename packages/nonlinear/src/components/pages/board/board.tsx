import {$s} from '@/app'
import {ws} from '@garage44/common/app'
import {TicketCard} from '@/components/elements/ticket/ticket'
import {useEffect} from 'preact/hooks'

const LANES = [
    {id: 'backlog', label: 'Backlog'},
    {id: 'todo', label: 'Todo'},
    {id: 'in_progress', label: 'In Progress'},
    {id: 'review', label: 'Review'},
    {id: 'closed', label: 'Closed'},
] as const

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

    const getTicketsForLane = (status: string) => {
        return $s.tickets.filter((ticket) => ticket.status === status)
    }

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
    }

    const handleDrop = async(e: DragEvent, targetStatus: string) => {
        e.preventDefault()
        const ticketId = e.dataTransfer?.getData('text/plain')
        if (!ticketId) return

        // Update ticket status
        await ws.put(`/api/tickets/${ticketId}`, {
            status: targetStatus,
        })
    }

    return (
        <div class='c-board'>
            <div class='c-board__header'>
                <h1>Kanban Board</h1>
            </div>
            <div class='c-board__lanes'>
                {LANES.map((lane) => {
                    const tickets = getTicketsForLane(lane.id)
                    return (
                        <div
                            key={lane.id}
                            class='c-board__lane'
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, lane.id)}
                        >
                            <div class='c-board__lane-header'>
                                <h2>{lane.label}</h2>
                                <span class='c-board__lane-count'>{tickets.length}</span>
                            </div>
                            <div class='c-board__lane-content'>
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, ticket.id)}
                                    >
                                        <TicketCard ticket={ticket} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
