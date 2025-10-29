import classnames from 'classnames'
import {useEffect} from 'preact/hooks'
import {Router, Route} from 'preact-router'
import {$s} from '@/app'
import {api, logger, store} from '@garage44/common/app'
import {IconLogo, Notifications, PanelContext} from '@garage44/common/components'
import {emojiLookup} from '@/models/chat'
import ConferenceControls from './controls/controls-main'
import ChannelsContext from './context/context-channels'
import {Link} from 'preact-router'
import {Channel} from './channel/channel'
import {Login} from './login/login'

export const ConferenceApp = () => {
    useEffect(() => {
        (async () => {
            const themeColor = getComputedStyle(document.querySelector('.app')).getPropertyValue('--grey-4')
            const metaTheme = document.querySelector('meta[name="theme-color"]')
            if (metaTheme) (metaTheme as HTMLMetaElement).content = themeColor

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
            'panel-context-collapsed': $s.panels.context.collapsed,
        })}>

            <PanelContext
                collapsed={$s.panels.context.collapsed}
                logoHref="/admin/groups"
                logoText="PYRITE"
                logoVersion={process.env.APP_VERSION || '2.0.0'}
                LogoIcon={IconLogo}
                LinkComponent={Link}
                navigation={<ChannelsContext />}
            />

            <ConferenceControls />

            <Router>
                <Route path="/channels/:channelId" component={Channel} />
                <Route path="/login" component={Login} />
                <Route default component={() => (
                    <div class="c-welcome">
                        <IconLogo />
                        <h1>Welcome to Pyrite</h1>
                        <p>Select a channel from the sidebar to start chatting.</p>
                    </div>
                )} />
            </Router>

            <Notifications notifications={$s.notifications} />
        </div>
    )
}
