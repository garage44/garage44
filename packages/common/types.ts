import type {DeepSignal} from 'deepsignal'

type LogLevel = 'error' | 'warn' | 'info' | 'success' | 'verbose' | 'debug'

interface LoggerConfig {
    level?: LogLevel
    colors?: boolean
    file?: string
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
        selection: string
        i18n: Record<string, Record<string, string>>
        options: any[]
    }
    notifications: []
    panel: {
        collapsed: boolean
    }
    theme: 'dark' | 'light' | 'system'
    user: DeepSignal<{
        admin: boolean
        authenticated: boolean
    }>
}


interface TargetLanguage {
    engine: 'anthropic' | 'deepl'
    id: string
    formality: 'informal' | 'formal'
}

export {
    type CommonState,
    type LoggerConfig,
    type LogLevel,
    type TargetLanguage,
}