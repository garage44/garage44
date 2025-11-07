import type {DeepSignal} from 'deepsignal'

type LogLevel = 'error' | 'warn' | 'info' | 'success' | 'verbose' | 'debug'

interface LoggerConfig {
    colors?: boolean
    file?: string
    level?: LogLevel
    timestamp?: boolean
}

interface CommonState {
    env: {
        ctrlKey: boolean
        isFirefox: boolean
        layout: 'desktop' | 'mobile' | 'tablet'
        shiftKey: boolean
        url: string
    }
    language_ui: {
        i18n: Record<string, Record<string, string>>
        options: any[]
        selection: string
    }
    notifications: []
    panels: {
        context: {
            collapsed: boolean
            width?: number
        }
        menu: {
            collapsed: boolean
            width?: number
        }
    }
    profile: {
        admin: boolean
        authenticated: boolean
        avatar: string
        displayName: string
        id: string | null
        password: string
        username: string
    }
    theme: 'dark' | 'light' | 'system'
}


interface TargetLanguage {
    engine: 'anthropic' | 'deepl'
    formality: 'informal' | 'formal'
    id: string
}

export {
    type CommonState,
    type LoggerConfig,
    type LogLevel,
    type TargetLanguage,
}