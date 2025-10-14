import classnames from 'classnames'
import {useEffect} from 'preact/hooks'
import {Router, Route} from 'preact-router'
import Controls from './controls/controls'
import GroupsContext from './context/context-groups'
import {Notifications, PanelContext} from '@/components/elements'
import UsersContext from './context/context-users'
import {Groups} from './groups'
import {Users} from './users/users'
import {$s} from '@/app'

export const AdminApp = () => {
    useEffect(() => {
        const themeColor = getComputedStyle(document.querySelector('.app')).getPropertyValue('--grey-4')
        const metaTheme = document.querySelector('meta[name="theme-color"]')
        if (metaTheme) metaTheme.content = themeColor
    }, [])

    return (
        <div class={classnames('c-admin-app app', `theme-${$s.theme.id}`)}>
            <PanelContext>
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
