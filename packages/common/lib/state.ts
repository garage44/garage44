import type {DeepSignal} from 'deepsignal'


const persistentState = {
    language_ui: {
        selection: 'eng-gbr',
    },
    panel: {
        collapsed: false,
    },
} as const

const volatileState = {
    env: {
        layout: 'desktop',
    },
    language_ui: {
        /** Stores the calls to i18next.t, allowing to reactively update $t */
        i18n: {} as Record<string, unknown>,
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
    user: {
        admin: false,
        authenticated: null,
        password: '',
        username: '',
    },
}

export {
    persistentState,
    volatileState,
}