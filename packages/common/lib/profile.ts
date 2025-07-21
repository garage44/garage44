function adminContext() {
    return {admin: true, authenticated: true}
}

function deniedContext() {
    return {authenticated: false, permission: false}
}

function userContext() {
    return {admin: false, authenticated: true}
}

export {
    adminContext,
    deniedContext,
    userContext,
}