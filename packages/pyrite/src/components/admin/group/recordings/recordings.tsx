// TODO: Implement recordings management
import {$s} from '@/app'

interface RecordingsProps {
    groupId?: string
}

export default function Recordings({ groupId }: RecordingsProps) {
    return (
        <section class="c-admin-group-recordings tab-content active">
            <div>Recordings management for group {groupId} - to be implemented</div>
        </section>
    )
}
