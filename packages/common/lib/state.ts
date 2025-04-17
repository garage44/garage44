import type {DeepSignal} from 'deepsignal'

export interface CommonState {
    env: {
        ctrlKey: boolean
        isFirefox: boolean
        layout: 'desktop' | 'mobile' | 'tablet'
        shiftKey: boolean
    }
    language_ui: {
        selection: string
        i18n: Record<string, Record<string, string>>
        options: any[]
    }
    notifications: []
    panel: {
        collapsed: boolean
    }
    user: DeepSignal<{
        admin: boolean
        authenticated: boolean
    }>
}

export const persistentState = {
    language_ui: {
        selection: 'eng-gbr',
    },
    panel: {
        collapsed: false,
    },
} as const

export const volatileState = {
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
