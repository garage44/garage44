import {$s, ws} from '@/app'
import {api} from '@garage44/common/app'
import {Router} from 'preact-router'
import {classes, mergeDeep} from '@garage44/common/lib/utils'
import {ConferenceApp} from '../conference/app'
import {AdminApp} from '../admin/app'
import {Notifications} from '@garage44/common/components'
import {useEffect} from 'preact/hooks'

export const Main = () => {
    useEffect(() => {
        (async () => {
            const context = await api.get('/api/context')
            mergeDeep($s.admin, context)

            if (context.authenticated) {
                ws.connect()
            }

            // Load emoji list
            if (!$s.chat.emoji?.list?.length) {
                const emojiData = await api.get('/api/chat/emoji')
                $s.chat.emoji.list = JSON.parse(emojiData)
            }
        })()
    }, [])

    if ($s.admin.authenticated === null) {
        return null
    }

    return <div class={classes('app', {
        [`theme-${$s.theme.id}`]: true,
    })}>
        <Router>
            {/* Admin routes */}
            <AdminApp path="/admin/*" />

            {/* Conference routes (default) */}
            <ConferenceApp default path="/*" />
        </Router>
        <Notifications notifications={$s.notifications}/>
    </div>
}
