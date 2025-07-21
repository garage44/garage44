import type {TargetLanguage} from '@garage44/common/types.ts'

type TranslationTarget = Record<string, string>

interface TranslationEntry {
    cache: string
    source: string
    target: TranslationTarget
}

interface TranslationGroup {
    [key: string]: TranslationEntry | TranslationGroup
}

export type I18n = Record<string, TranslationGroup>

export interface WorkspaceConfig {
    languages: {
        source: string
        target: TargetLanguage[]
    }
    source_file: string | null
    sync: {
        dir: string
        enabled: boolean
    }
    workspace_id: string
}

export interface Workspace {
    config: WorkspaceConfig
    i18n: I18n
}

export interface WorkspaceDescription {
    source_file: string
    status?: 'existing' | 'new'
    workspace_id?: string
}
