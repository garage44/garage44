import {
    persistentState as commonPersistantState,
    volatileState as commonVolatileState,
} from '@garage44/common/lib/state'
import {mergeDeep} from '@garage44/common/lib/utils'

// Pyrite state management using DeepSignal pattern
import type {PyriteState} from '../types.ts'

export const persistantState: Partial<PyriteState> = mergeDeep({
    chat: {
        emoji: {
            list: [],
        },
    },
    devices: {
        audio: {
            enabled: true,
            options: [],
            selected: {id: null, name: ''},
        },
        cam: {
            enabled: true,
            options: [],
            resolution: {id: 'default', name: ''},
            selected: {id: null, name: ''},
        },
        mic: {
            enabled: true,
            options: [],
            selected: {id: null, name: ''},
        },
    },
    language: {id: null},
    language_ui: {
        i18n: {},
        options: [
            {id: 'deu', name: 'Deutsch'},
            {id: 'eng-gbr', name: 'English'},
            {id: 'fra', name: 'Français'},
            {id: 'nld', name: 'Nederlands'},
        ],
        selection: 'eng-gbr',
    },
    loading: true,
    media: {
        accept: {id: 'everything', name: ''},
        upstream: {id: 'normal', name: ''},
    },
    panels: {
        chat: {
            collapsed: false,
        },
        context: {
            collapsed: false,
        },
        settings: {
            collapsed: false,
        },
    },
    theme: 'system',
}, commonPersistantState)

// State is always overwritten by these properties
export const volatileState: Partial<PyriteState> = mergeDeep({
    admin: {
        authenticated: null,
        group: null,
        groups: [],
        permission: false,
        user: null,
        users: [],
    },
    channels: [],
    chat: {
        activeChannelId: null,
        channel: '',
        channels: {
            main: {
                id: 'main',
                messages: [],
                unread: 0,
            },
        },
        emoji: {
            active: false,
            lookup: {},
        },
        message: '',
        width: 375,
    },
    env: {
        isBrowser: true,
        isFirefox: false,
        isSafari: false,
        layout: 'desktop',
        ua: '',
    },
    files: {
        playing: [],
        upload: [],
    },
    group: {
        'allow-anonymous': false,
        comment: '',
        connected: false,
        contact: '',
        locked: false,
        muted: false,
        name: '',
        recording: false,
    },
    groups: [],
    login: {
        autofocus: true,
    },
    mediaReady: false,
    notifications: [],
    permissions: {
        op: false,
        // Assume present permission before connecting,
        // so send can be modified in Settings.
        present: true,
        record: false,
    },
    streams: [],
    upMedia: {
        audio: [],
        camera: [],
        screenshare: [],
        video: [],
    },
    users: [],
}, commonVolatileState)
