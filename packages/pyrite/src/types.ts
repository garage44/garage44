// Pyrite TypeScript types
import type {CommonState} from '@garage44/common/types'

export interface PyriteState extends CommonState {
    admin: {
        authenticated: boolean | null
        group: any
        groups: any[]
        permission: boolean
        user: any
        users: any[]
    }
    chat: {
        channel: string
        channels: {
            [key: string]: {
                id: string
                messages: any[]
                unread: number
            }
        }
        emoji: {
            active: boolean
            list?: any[]
            lookup: any
        }
        message: string
        width: number
    }
    devices: {
        audio: {
            enabled: boolean
            options: any[]
            selected: {id: string | null, name: string}
        }
        cam: {
            enabled: boolean
            options: any[]
            resolution: {id: string, name: string}
            selected: {id: string | null, name: string}
        }
        mic: {
            enabled: boolean
            options: any[]
            selected: {id: string | null, name: string}
        }
    }
    env: {
        isBrowser: boolean
        isFirefox: boolean
        isSafari: boolean
        layout: string
        ua: string
    }
    files: {
        playing: any[]
        upload: any[]
    }
    group: {
        'allow-anonymous': boolean
        comment: string
        connected: boolean
        contact: string
        locked: boolean
        muted: boolean
        name: string
        recording: boolean
    }
    groups: any[]
    language: {id: string | null}
    language_ui: {
        selection: string
        i18n: Record<string, Record<string, string>>
        options: any[]
    }
    loading: boolean
    login: {
        autofocus: boolean
    }
    media: {
        accept: {id: string, name: string}
        upstream: {id: string, name: string}
    }
    mediaReady: boolean
    notifications: any[]
    panels: {
        chat: {collapsed: boolean}
        context: {collapsed: boolean}
        settings: {collapsed: boolean}
    }
    permissions: {
        op: boolean
        present: boolean
        record: boolean
    }
    streams: any[]
    theme: 'light' | 'dark' | 'system'
    upMedia: {
        audio: any[]
        camera: any[]
        screenshare: any[]
        video: any[]
    }
    user: {
        authOption: string
        data: {
            availability: {id: string, name: string}
            mic: boolean
            raisehand: boolean
        }
        id: string | null
        name: string
        username: string
        password: string
    }
    users: any[]
}
