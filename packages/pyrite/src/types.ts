// Pyrite TypeScript types
import type {CommonState} from '@garage44/common/types'

export interface Channel {
    created_at: number
    description: string
    id: number
    member_count?: number
    name: string
    slug: string
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
                members?: Record<string, {avatar: string}>
                messages: any[]
                typing?: {
                    [userId: string]: {
                        timestamp: number
                        userId: string | number
                        username: string
                    }
                }
                unread: number
            }
        }
        emoji: {
            active: boolean
            list?: any[]
            lookup: any
        }
        message: string
        // Global users map: userId -> {username, avatar, status?}
        users?: Record<string, {avatar: string; username: string; status?: 'online' | 'offline' | 'busy'}>
        width: number
    }
    devices: {
        audio: {
            enabled: boolean
            options: any[]
            selected: {id: string | null; name: string}
        }
        cam: {
            enabled: boolean
            options: any[]
            resolution: {id: string; name: string}
            selected: {id: string | null; name: string}
        }
        mic: {
            enabled: boolean
            options: any[]
            selected: {id: string | null; name: string}
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
        i18n: Record<string, Record<string, string>>
        options: any[]
        selection: string
    }
    loading: boolean
    login: {
        autofocus: boolean
    }
    media: {
        accept: {id: string; name: string}
        upstream: {id: string; name: string}
    }
    mediaReady: boolean
    notifications: any[]
    permissions: {
        op: boolean
        present: boolean
        record: boolean
    }
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
            availability: {id: string; name: string}
            mic: boolean
            raisehand: boolean
        }
    }
    streams: any[]
    theme: 'light' | 'dark' | 'system'
    upMedia: {
        audio: any[]
        camera: any[]
        screenshare: any[]
        video: any[]
    }
    users: any[]
}
