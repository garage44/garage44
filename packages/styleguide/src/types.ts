import type {CommonState} from '@garage44/common/types'

export interface StyleguideState extends CommonState {
    currentRoute: string
    selectedComponent: string | null
    sidebarCollapsed: boolean
    theme: 'light' | 'dark'
}