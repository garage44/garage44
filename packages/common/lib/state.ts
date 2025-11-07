const persistentState = {
    beta: true,
    panels: {
        context: {
            collapsed: false,
            width: 200,
        },
        menu: {
            collapsed: false,
            width: 240,
        },
    },
    theme: 'system',
} as const

const volatileState = {
    env: {
        isBrowser: true,
        isFirefox: false,
        isSafari: false,
        layout: 'desktop',
        ua: '',
        url: '',
    },
    notifications: [] as unknown[],
    profile: {
        admin: false,
        authenticated: false,
        avatar: 'placeholder-1.png',
        displayName: '',
        id: null,
        password: '',
        username: '',
    },
}

export {
    persistentState,
    volatileState,
}