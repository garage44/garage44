import {useEffect} from 'preact/hooks'
import {Router, Route, route} from 'preact-router'
import {$s} from '@/app'
import {api, logger, store} from '@garage44/common/app'
import {IconLogo, Notifications, AppLayout, PanelMenu, PanelContext, UserMenu} from '@garage44/common/components'
import {mergeDeep} from '@garage44/common/lib/utils'
import {emojiLookup} from '@/models/chat'
import ConferenceControls from './controls/controls-main'
import ChannelsContext from './context/context-channels'
import PanelContextVideo from './video/panel-context-video'
import {VideoStrip} from './video/video-strip'
import {Link} from 'preact-router'
import {Channel} from './channel/channel'
import {Login} from './login/login'
import ProfileSettings from './settings/profile-settings'

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

            // Load current user info to populate $s.profile and $s.user.id
            try {
                const userData = await api.get('/api/users/me')
                if (userData?.id) {
                    $s.user.id = userData.id
                    $s.profile.id = userData.id
                    $s.profile.username = userData.username || ''
                    $s.profile.displayName = userData.profile?.displayName || userData.username || 'User'
                    $s.profile.avatar = userData.profile?.avatar || 'placeholder-1.png'

                    // Ensure chat.users entry exists for backward compatibility
                    if (!$s.chat.users) {
                        $s.chat.users = {}
                    }
                    $s.chat.users[userData.id] = {
                        avatar: $s.profile.avatar,
                        username: $s.profile.username,
                    }
                    logger.info(`[ConferenceApp] Loaded user: ${userData.id}, avatar: ${$s.profile.avatar}`)
                }
            } catch (error) {
                logger.warn('[ConferenceApp] Failed to load current user:', error)
            }
        })()
    }, [])

    const handleLogout = async () => {
        const context = await api.get('/api/logout')
        mergeDeep($s.admin, context)
        // Clear stored credentials
        $s.user.username = ''
        $s.user.password = ''
        store.save()
        route('/')
    }

    return (
        <div class="c-conference-app app">
            <AppLayout
                menu={
                    <PanelMenu
                        actions={
                            <UserMenu
                                collapsed={$s.panels.context.collapsed}
                                onLogout={handleLogout}
                                settingsHref="/settings"
                                user={{
                                    id: $s.profile.id || undefined,
                                    profile: {
                                        displayName: $s.profile.displayName || 'User',
                                        avatar: $s.profile.avatar || undefined,
                                    },
                                }}
                            />
                        }
                        collapsed={$s.panels.context.collapsed}
                        onCollapseChange={(collapsed) => {
                            $s.panels.context.collapsed = collapsed
                        }}
                        logoHref="/admin/groups"
                        logoText="PYRITE"
                        logoVersion={process.env.APP_VERSION || '2.0.0'}
                        LogoIcon={IconLogo}
                        LinkComponent={Link}
                        navigation={<ChannelsContext />}
                    />
                }
                context={
                    <PanelContext
                        collapsed={false}
                        onCollapseChange={(_collapsed) => {
                            // Context panel collapse state can be added if needed
                        }}
                    >
                        <ConferenceControls />
                        {$s.group.connected && (
                            <>
                                <PanelContextVideo />
                                <VideoStrip />
                            </>
                        )}
                    </PanelContext>
                }
            >
                <Router>
                    <Route path="/channels/:channelId" component={Channel} />
                    <Route path="/login" component={Login} />
                    <Route path="/settings" component={ProfileSettings} />
                    <Route default component={() => (
                        <div class="c-welcome">
                            <IconLogo />
                            <h1>Welcome to Pyrite</h1>
                            <p>Select a channel from the sidebar to start chatting.</p>
                        </div>
                    )} />
                </Router>
                <Notifications notifications={$s.notifications} />
            </AppLayout>
        </div>
    )
}
