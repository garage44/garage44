import type {CommonState, TargetLanguage} from '@garage44/common/types'
import type {DeepSignal} from 'deepsignal'
import type {EnolaConfig} from '@garage44/enola/types'
import workspace from '@/.expressio.json'

type TranslationTarget = Record<string, string>

interface TranslationEntry {
    cache: string
    source: string
    target: TranslationTarget
}

interface TranslationGroup {
    [key: string]: TranslationEntry | TranslationGroup
}

// Extract i18n type from JSON structure
type I18nType = typeof workspace.i18n

// Keep I18n as alias for backward compatibility
type I18n = I18nType

interface WorkspaceConfig {
    languages: {
        source: string
        target: TargetLanguage[]
    }
    source_file: string | null
    sync: {
        dir: string
        enabled: boolean
        suggestions?: boolean
    }
    workspace_id: string
}

interface Workspace {
    config: WorkspaceConfig
    i18n: I18n
}

interface WorkspaceDescription {
    source_file: string
    status?: 'existing' | 'new'
    workspace_id?: string
}

interface ExpressioStateBase {
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
    enola: EnolaConfig
    filter: string
    sort: 'asc' | 'desc'
    /** Keeps track which tags have been updated for visual feedback */
    tags: {
        updated: string
    }
    workspace: Workspace
    workspaces: DeepSignal<[WorkspaceDescription]>
}

type ExpressioState = DeepSignal<ExpressioStateBase>

export {
    ExpressioState,
    type I18n,
    type I18nType,
    type TranslationEntry,
    type TranslationGroup,
    type TranslationTarget,
    type Workspace,
    type WorkspaceConfig,
    type WorkspaceDescription,
}