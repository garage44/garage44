import {deleteRecording, loadRecordings, recordingPath} from '../lib/recording.ts'

export default function(router: any) {

    router.get('/api/recordings/:groupid', async (req: Request, params: Record<string, string>, session: any) => {
        const groupId = params.param0
        const recordings = await loadRecordings(groupId)
        return new Response(JSON.stringify(recordings), {
            headers: { 'Content-Type': 'application/json' }
        })
    })

    router.get('/api/recordings/:groupid/:recording', async (req: Request, params: Record<string, string>, session: any) => {
        const groupId = params.param0
        const recording = params.param1
        const recordingTarget = recordingPath(groupId, recording)

        // Serve the recording file
        try {
            const file = Bun.file(recordingTarget)
            if (await file.exists()) {
                return new Response(file)
            } else {
                return new Response(JSON.stringify({error: 'recording not found'}), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 404
                })
            }
        } catch (error) {
            return new Response(JSON.stringify({error: 'failed to load recording'}), {
                headers: { 'Content-Type': 'application/json' },
                status: 500
            })
        }
    })

    router.get('/api/recordings/:groupid/:recording/delete', async (req: Request, params: Record<string, string>, session: any) => {
        const groupId = params.param0
        const recording = params.param1

        const recordings = await deleteRecording(groupId, recording)
        return new Response(JSON.stringify(recordings), {
            headers: { 'Content-Type': 'application/json' }
        })
    })
}
