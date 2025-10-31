const persistentState = {
    beta: true,
    language_ui: {
        selection: 'eng-gbr',
    },
    panel: {
        collapsed: false,
    },
    theme: 'system',
} as const

const volatileState = {
    env: {
        layout: 'desktop',
        url: '',
    },
    language_ui: {
        /** Stores the calls to i18next.t, allowing to reactively update $t */
        i18n: {} as Record<string, Record<string, string>>,
        options: [
            {id: 'ara', name: 'Arabic'},
            {id: 'zho', name: 'Chinese (Simplified)'},
            {id: 'nld', name: 'Dutch'},
            {id: 'eng-gbr', name: 'English'},
            {id: 'fra', name: 'French'},
            {id: 'deu', name: 'German'},
        ],
    },
    notifications: [] as unknown[],
    profile: {
        avatar: 'placeholder-1.png',
        displayName: '',
        id: null,
        username: '',
    },
}

export {
    persistentState,
    volatileState,
}