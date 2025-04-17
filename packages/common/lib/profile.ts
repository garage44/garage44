export function adminContext() {
    return {admin: true, authenticated: true}
}

export function deniedContext() {
    return {authenticated: false, permission: false}
}

export function userContext() {
    return {admin: false, authenticated: true}
}
