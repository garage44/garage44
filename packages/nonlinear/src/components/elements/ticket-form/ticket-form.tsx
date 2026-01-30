import {$s} from '@/app'
import {ws, notifier} from '@garage44/common/app'
import {Button, FieldSelect, FieldText, FieldTextarea} from '@garage44/common/components'
import {createValidator, required} from '@garage44/common/lib/validation'
import {deepSignal} from 'deepsignal'
import {useRef} from 'preact/hooks'

interface TicketFormProps {
    initialStatus: 'backlog' | 'todo' | 'in_progress' | 'review' | 'closed'
    onClose: () => void
    onSuccess: () => void
}

// State defined outside component for stability
const createFormState = () => deepSignal({
    assignee_id: '',
    assignee_type: '' as '' | 'agent' | 'human',
    description: '',
    priority: '',
    repository_id: '',
    title: '',
})

export const TicketForm = ({initialStatus, onClose, onSuccess}: TicketFormProps) => {
    const stateRef = useRef(createFormState())
    const state = stateRef.current

    const {isValid, validation} = createValidator({
        repository_id: [state.$repository_id, required('Repository is required')],
        title: [state.$title, required('Title is required')],
    })

    const handleSubmit = async() => {
        if (!isValid.value) {
            return
        }

        try {
            const ticketData: {
                assignee_id?: string | null
                assignee_type?: 'agent' | 'human' | null
                description?: string
                priority?: number
                repository_id: string
                status: string
                title: string
            } = {
                repository_id: state.repository_id,
                status: initialStatus,
                title: state.title,
            }

            if (state.description) {
                ticketData.description = state.description
            }

            if (state.priority) {
                const priorityNum = parseInt(state.priority, 10)
                if (!isNaN(priorityNum)) {
                    ticketData.priority = priorityNum
                }
            }

            if (state.assignee_type) {
                ticketData.assignee_type = state.assignee_type
                if (state.assignee_id) {
                    ticketData.assignee_id = state.assignee_id
                }
            }

            await ws.post('/api/tickets', ticketData)

            notifier.notify({
                message: 'Ticket created successfully',
                type: 'success',
            })
            onSuccess()
            onClose()
        } catch(error) {
            notifier.notify({
                message: `Failed to create ticket: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'error',
            })
        }
    }

    // Get assignee options based on assignee_type
    const getAssigneeOptions = () => {
        if (state.assignee_type === 'agent') {
            return $s.agents
                .filter((agent) => agent.enabled)
                .map((agent) => ({
                    id: agent.id,
                    name: `${agent.name} (${agent.type})`,
                }))
        }
        if (state.assignee_type === 'human') {
            // For now, return empty - would need user list
            return []
        }
        return []
    }

    return (
        <div class='c-ticket-form'>
            <div class='header'>
                <h2>Create New Ticket</h2>
                <Button
                    icon='close'
                    onClick={onClose}
                    size='s'
                    tip='Close'
                    type='info'
                    variant='toggle'
                />
            </div>
            <div class='content'>
                <FieldSelect
                    label='Repository'
                    model={state.$repository_id}
                    options={$s.repositories.map((repo) => ({
                        id: repo.id,
                        name: repo.name,
                    }))}
                    placeholder='Select repository'
                    validation={validation.value.repository_id}
                />
                <FieldText
                    autofocus
                    label='Title'
                    model={state.$title}
                    placeholder='Enter ticket title'
                    validation={validation.value.title}
                />
                <FieldTextarea
                    help='Optional description of the ticket'
                    label='Description'
                    onChange={(value) => {
                        state.description = value
                    }}
                    placeholder='Enter ticket description'
                    value={state.description}
                />
                <FieldText
                    help='Optional priority number (higher = more important)'
                    label='Priority'
                    model={state.$priority}
                    placeholder='Enter priority number'
                    type='number'
                />
                <div class='field-group'>
                    <FieldSelect
                        help='Optional assignee type'
                        label='Assignee Type'
                        model={state.$assignee_type}
                        onChange={() => {
                            // Reset assignee_id when type changes
                            state.assignee_id = ''
                        }}
                        options={[
                            {id: '', name: 'None'},
                            {id: 'agent', name: 'Agent'},
                            {id: 'human', name: 'Human'},
                        ]}
                        placeholder='Select assignee type'
                    />
                    {state.assignee_type &&
                        <FieldSelect
                            help='Select specific assignee'
                            label='Assignee'
                            model={state.$assignee_id}
                            options={getAssigneeOptions()}
                            placeholder='Select assignee'
                        />}
                </div>
            </div>
            <div class='actions'>
                <Button
                    onClick={onClose}
                    type='info'
                    variant='secondary'
                >
                    Cancel
                </Button>
                <Button
                    disabled={!isValid.value}
                    onClick={handleSubmit}
                    type='primary'
                >
                    Create Ticket
                </Button>
            </div>
        </div>
    )
}
