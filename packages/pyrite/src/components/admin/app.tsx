import classnames from 'classnames'
import {useEffect} from 'preact/hooks'
import {Router, Route, Link} from 'preact-router'
import Controls from './controls/controls'
import GroupsContext from './context/context-groups'
import {IconLogo, Notifications, PanelContext} from '@garage44/common/components'
import UsersContext from './context/context-users'
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
        <div class={classnames('c-admin-app app', `theme-${$s.theme.id}`)}>
            <PanelContext
                collapsed={$s.panels.context.collapsed}
                logoHref="/admin/groups"
                logoText="PYRITE"
                logoVersion={process.env.APP_VERSION || '2.0.0'}
                LogoIcon={IconLogo}
                LinkComponent={Link}
                animate={animate}
            >
                <GroupsContext />
            </PanelContext>
            <Controls />
            <Router>
                <Route path="/admin/groups" component={Groups} />
                <Route path="/admin/groups/:groupId" component={Groups} />
                <Route path="/admin/users" component={Users} />
                <Route path="/admin/users/:userId" component={Users} />
                <Route default component={Groups} />
            </Router>
            <Notifications notifications={$s.notifications} />
        </div>
    )
}
