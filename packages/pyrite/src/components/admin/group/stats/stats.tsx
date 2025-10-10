// TODO: Implement stats dashboard with Chart component
import {Chart} from '@/components/elements'

interface StatsProps {
    groupId?: string
}

export default function Stats({ groupId }: StatsProps) {
    return (
        <section class="c-admin-group-stats tab-content active">
            <div>Statistics dashboard for group {groupId} - to be implemented</div>
            {/* <Chart data={statsData} name="Group Statistics" /> */}
        </section>
    )
}
