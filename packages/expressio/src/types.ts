import type {CommonState, TargetLanguage} from '@garage44/common/types'
import type {DeepSignal} from 'deepsignal'
import type {EnolaConfig} from '@garage44/enola/types'

type TranslationTarget = Record<string, string>

interface TranslationEntry {
    cache: string
    source: string
    target: TranslationTarget
}

interface TranslationGroup {
    [key: string]: TranslationEntry | TranslationGroup
}

type I18n = Record<string, TranslationGroup>

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

interface ExpressioStateBase extends CommonState {
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
    type TranslationEntry,
    type TranslationGroup,
    type TranslationTarget,
    type Workspace,
    type WorkspaceConfig,
    type WorkspaceDescription,
}