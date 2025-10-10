import {loadGroups} from './group.js'
import {loadUsers} from './user.js'

export async function authContext() {
    const [{groupsData}, users] = await Promise.all([loadGroups(), loadUsers()])
    return {
        authenticated: true,
        groups: groupsData,
        permission: true,
        users,
    }
}

export function noAuthContext() {
    return {authenticated: false, permission: false}
}

export function noPermissionContext() {
    return {authenticated: true, permission: false}
}
