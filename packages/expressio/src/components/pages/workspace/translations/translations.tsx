import {$s} from '@/app'
import {ws} from '@garage44/common/app'
import {pathCreate, pathDelete, pathUpdate} from '@garage44/common/lib/paths.ts'
import type {EnolaTag} from '../../../../../lib/enola/types.ts'
import {GroupActions} from '@/components/elements/group-actions/group-actions'
import {Button, FieldText, Icon} from '@garage44/common/components'
import {TranslationGroup} from '@/components/elements'
import classnames from 'classnames'
import {events} from '@garage44/common/app'
import {useEffect} from 'preact/hooks'

// Define interface for the tag object
interface TagData {
    path: string[]
    value: EnolaTag
}

export function WorkspaceTranslations() {
    // Component is not rendered while the workspace is not set
    if (!$s.workspace) return null

    // Add keyboard event handler for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only process if we have a workspace
            if (!$s.workspace) return

            // Ignore events in input fields or content editable elements
            if (e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target instanceof HTMLElement && e.target.isContentEditable)) {
                return
            }

            // Check for undo: Ctrl+Z (or Cmd+Z on Mac)
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
                e.preventDefault() // Prevent browser's default undo
                ws.post(`/api/workspaces/${$s.workspace.config.workspace_id}/undo`, {})
            }

            // Check for redo: Ctrl+Shift+Z (or Cmd+Shift+Z on Mac)
            // Also support Ctrl+Y as an alternative
            if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
                ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'y')) {
                e.preventDefault() // Prevent browser's default redo
                ws.post(`/api/workspaces/${$s.workspace.config.workspace_id}/redo`, {})
            }
        }

        // Add event listener
        window.addEventListener('keydown', handleKeyDown)
        // Clean up event listener when component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, []) // Empty dependency array means this runs once on mount

    return <div class="c-translations">
        <div className={classnames('workspace-info', {disabled: !$s.workspace})}>
            <GroupActions className="horizontal" group={$s.workspace.i18n} path={[]}/>
            <div className="history-actions">
                <Icon
                    name="chevron_left"
                    onClick={async() => {
                        ws.post(`/api/workspaces/${$s.workspace.config.workspace_id}/undo`, {})
                    }}
                    tip={'History'}
                    type="info"
                />
                <Icon
                    name="history"
                    tip={'History'}
                    type="info"
                />
                <Icon
                    name="chevron_right"
                    onClick={async() => {
                        ws.post(`/api/workspaces/${$s.workspace.config.workspace_id}/redo`, {})
                    }}
                    tip={'History'}
                    type="info"
                />
            </div>
            <div className="translation-controls">
                <FieldText
                    model={$s.$filter}
                    placeholder={'Filter tag, translation or group...'}
                />
                <Button
                    icon={$s.sort === 'asc' ? 'arrow_up_circle_ouline' : 'arrow_down_circle_outline'}
                    onClick={() => $s.sort = ($s.sort === 'asc' ? 'desc' : 'asc')}
                    type="info"
                    label={`Sort: ${$s.sort === 'asc' ? 'A-Z' : 'Z-A'}`}
                />
            </div>
        </div>

        <TranslationGroup
            group={{_id: 'root', ...$s.workspace.i18n}}
            path={[]}
            filter={$s.filter}
            sort={$s.sort}
        />
    </div>
}

events.on('app:init', () => {
    ws.on('/i18n/sync', ({create_tags, delete_tags, modify_tags}) => {
        for (const tag of create_tags) {
            const {path, value}: TagData = tag
            pathCreate($s.workspace.i18n, path, value, $s.workspace.config.languages.target, value.target)
        }
        for (const tag of delete_tags) {
            const {path}: {path: string[]} = tag
            pathDelete($s.workspace.i18n, path)
        }

        for (const tag of modify_tags) {
            const {path, value}: TagData = tag
            pathUpdate($s.workspace.i18n, path, value)
        }
    })

    // Add handler for full i18n state updates
    ws.on('/i18n/state', ({i18n, timestamp, workspace_id}) => {

        // Only apply updates for the current workspace
        if (!$s.workspace || $s.workspace.config.workspace_id !== workspace_id) {
            return
        }

        // Check if this update is newer than our current state
        // This prevents race conditions if messages arrive out of order
        // @ts-ignore: lastStateUpdateTime is attached dynamically
        if (!$s.workspace.lastStateUpdateTime || timestamp > ($s.workspace.lastStateUpdateTime ?? 0)) {
            // Apply the update
            $s.workspace.i18n = i18n
            // @ts-ignore: lastStateUpdateTime is attached dynamically
            $s.workspace.lastStateUpdateTime = timestamp
        }
    })

    // Add handler for undo/redo responses
    ws.on('/i18n/history', ({success}) => {
        if (success) {
            // The state update will come through the /i18n/state handler
        }
    })
})
