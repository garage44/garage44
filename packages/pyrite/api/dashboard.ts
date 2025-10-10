import {loadStats} from '../lib/dashboard.ts'

export default function(router: any) {

    router.get('/api/dashboard/:groupid', async (req: Request, params: Record<string, string>, session: any) => {
        const groupId = params.param0
        const stats = await loadStats(groupId)
        return new Response(JSON.stringify(stats), {
            headers: { 'Content-Type': 'application/json' }
        })
    })
}
