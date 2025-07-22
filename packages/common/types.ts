import type {DeepSignal} from 'deepsignal'

interface CommonState {
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


interface TargetLanguage {
    engine: 'anthropic' | 'deepl'
    id: string
    formality: 'informal' | 'formal'
}

export {
    type CommonState,
    type TargetLanguage,
}