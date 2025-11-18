import {useEffect} from 'preact/hooks'
import {Router, Route, Link} from 'preact-router'
import Controls from './controls/controls'
import GroupsContext from './context/context-groups'
import {IconLogo, Notifications, PanelContext} from '@garage44/common/components'
import {Groups} from './groups'
import {Users} from './users/users'
import {$s} from '@/app'
import animate from '@/lib/animate'

export const AdminApp = () => {
    useEffect(() => {
        const themeColor = getComputedStyle(document.querySelector('.app')).getPropertyValue('--grey-4')
        const metaTheme = document.querySelector('meta[name="theme-color"]')
        if (metaTheme) metaTheme.content = themeColor
    }, [])

    return (
        <div class='c-admin-app app'>
            <PanelContext
                animate={animate}
                collapsed={$s.panels.context.collapsed}
                LinkComponent={Link}
                logoHref='/settings/groups'
                LogoIcon={IconLogo}
                logoText='PYRITE'
                logoVersion={process.env.APP_VERSION || '2.0.0'}
            >
                <GroupsContext />
            </PanelContext>
            <Controls />
            <Router>
                <Route component={Groups} path='/settings/groups' />
                <Route component={Groups} path='/settings/groups/:groupId' />
                <Route component={Users} path='/settings/users' />
                <Route component={Users} path='/settings/users/:userId' />
                <Route component={Groups} default />
            </Router>
            <Notifications notifications={$s.notifications} />
        </div>
    )
}
