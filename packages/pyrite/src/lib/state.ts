// Pyrite state management using DeepSignal pattern
import type {PyriteState} from '../types.ts'

export const persistantState: Partial<PyriteState> = {
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
    theme: {id: 'system'},
    user: {
        authOption: 'user',
        data: {
            availability: {id: 'available', name: ''},
            mic: true,
            raisehand: false,
        },
        id: null,
        name: '',
        password: '',
    },
}

// State is always overwritten by these properties
export const volatileState: Partial<PyriteState> = {
    admin: {
        authenticated: null,
        group: null,
        groups: [],
        permission: false,
        user: null,
        users: [],
    },
    chat: {
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
}
