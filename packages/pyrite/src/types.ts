// Pyrite TypeScript types
import type {CommonState} from '@garage44/common/types'

export interface Channel {
    id: number
    name: string
    slug: string
    description: string
    created_at: number
    member_count?: number
    unread_count?: number
}

export interface PyriteState extends CommonState {
    admin: {
        authenticated: boolean | null
        group: any
        permission: boolean
        user: any
        users: any[]
    }
    channels: Channel[]
    chat: {
        activeChannelSlug: string | null
        channel: string
        channels: {
            [key: string]: {
                id: string
                messages: any[]
                unread: number
                members?: Record<string, {avatar: string}>
                typing?: {
                    [userId: string]: {
                        userId: string | number
                        username: string
                        timestamp: number
                    }
                }
            }
        }
        emoji: {
            active: boolean
            list?: any[]
            lookup: any
        }
        message: string
        width: number
        // Global users map: userId -> {username, avatar}
        users?: Record<string, {username: string; avatar: string}>
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
    sfu: {
        channel: {
            'allow-anonymous': boolean
            comment: string
            connected: boolean
            contact: string
            locked: boolean
            muted: boolean
            name: string
            recording: boolean
        }
        channels: Record<string, {
            audio: boolean
            clientCount?: number
            comment?: string
            connected?: boolean
            description?: string
            locked?: boolean
            video: boolean
        }>
        profile: {
            // Galene-specific user data
            availability: {id: string, name: string}
            mic: boolean
            raisehand: boolean
        }
    }
    theme: 'light' | 'dark' | 'system'
    upMedia: {
        audio: any[]
        camera: any[]
        screenshare: any[]
        video: any[]
    }
    users: any[]
}
