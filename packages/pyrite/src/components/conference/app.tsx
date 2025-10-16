import classnames from 'classnames'
import {useEffect, useRef, useState} from 'preact/hooks'
import {Router, Route} from 'preact-router'
import {$s} from '@/app'
import {api, logger, store} from '@garage44/common/app'
import {IconLogo, Notifications, PanelContext} from '@garage44/common/components'
import {emojiLookup} from '@/models/chat'
import ConferenceControls from './controls/controls-main'
import {GroupControls} from './controls/controls-group'
import GroupsContext from './context/context-groups'
import PanelChat from './chat/panel-chat'
import {Link} from 'preact-router'
import animate from '@/lib/animate'
import UsersContext from './context/context-users'
import {Group} from './group/group'
import {Login} from './login/login'

export const ConferenceApp = () => {
    const [chatToggle, setChatToggle] = useState(false)
    const chatRef = useRef(null)

    useEffect(() => {
        (async () => {
            const themeColor = getComputedStyle(document.querySelector('.app')).getPropertyValue('--grey-4')
            const metaTheme = document.querySelector('meta[name="theme-color"]')
            if (metaTheme) metaTheme.content = themeColor

            if (!$s.chat.emoji.list.length) {
                logger.info('retrieving initial emoji list')
                $s.chat.emoji.list = JSON.parse(await api.get('/api/chat/emoji'))
                store.save()
            }
            for (const emoji of $s.chat.emoji.list) {
                emojiLookup.add(emoji.codePointAt())
            }
        })()
    }, [])

    return (
        <div class={classnames('c-conference-app app', {
            connected: $s.group.connected,
            'panel-chat-collapsed': $s.panels.chat.collapsed,
            'panel-chat-toggle': chatToggle,
            'panel-context-collapsed': $s.panels.context.collapsed,
        })}>

            <PanelContext
                collapsed={$s.panels.context.collapsed}
                logoHref={$s.group.connected ? null : ($s.group.name ? `/admin/groups/${$s.group.name}/misc` : '/admin/groups')}
                logoText="PYRITE"
                logoVersion={process.env.APP_VERSION || '2.0.0'}
                LogoIcon={IconLogo}
                LinkComponent={Link}
                animate={animate}
            >
                {$s.group.connected ? <UsersContext /> : <GroupsContext />}
            </PanelContext>

            <ConferenceControls />

            <Router>
                <Route path="/groups/:groupId" component={Group} />
                <Route path="/groups/:groupId/login" component={Login} />
                <Route default component={GroupsContext} />
            </Router>

            {$s.group.connected && !$s.panels.chat.collapsed && (
                <PanelChat ref={chatRef} />
            )}

            {$s.group.connected && <GroupControls/>}
            <Notifications notifications={$s.notifications} />
        </div>
    )
}
