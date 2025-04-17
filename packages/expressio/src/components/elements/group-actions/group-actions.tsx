import {$s, ws} from '@/app'
import {classes, randomId} from '@garage44/common/lib/utils'
import {$t} from '@garage44/common/app'
import type {EnolaTag} from '@garage44/enola/types'
import {Icon} from '@garage44/common/components'
import {pathCreate} from '@garage44/common/lib/paths'
import {tag_updated} from '@/lib/ui'

// Define a more specific type for group instead of 'any'
interface TranslationGroup {
    _collapsed?: boolean;
    [key: string]: unknown;
}

export function GroupActions({className, group, path}: {className?: string, group: TranslationGroup, path: string[]}) {
    return <div class={classes('c-group-actions', className)}>
        <div className="collapse-toggle">
            <Icon
                name={(() => {
                    if ($s.env.ctrlKey) {
                        return 'plus_collaped'
                    } else if ($s.env.shiftKey) {
                        return 'plus_extra'
                    } else if (group._collapsed) {
                        return 'plus'
                    } else {
                        return 'minus'
                    }
                })()}
                onClick={(e) => {
                // Force uncollapse on Ctrl or Alt click. Ctrl-click will also
                // make the source tags uncollapse.
                    const forceUncollapse = e.ctrlKey || e.shiftKey
                    const newCollapsedState = forceUncollapse ? false : !group._collapsed
                    // Ctrl-click will uncollapse everything, Alt-click or collapsed state will collapse source tags
                    const tagModifier = e.ctrlKey ? {_collapsed: false} : e.shiftKey || newCollapsedState? {_collapsed: true} : null
                    ws.post(`/api/workspaces/${$s.workspace.config.workspace_id}/collapse`, {
                        path,
                        tag_modifier: tagModifier,
                        value: {_collapsed: newCollapsedState},
                    })
                }}
                size="s"
                tip={group._collapsed ? $t('translation.tip.translation_view') : $t('translation.tip.translation_hide')}
                type="info"
            />
        </div>

        <div class="group-actions">
            <Icon
                name="folder_plus_outline"
                onClick={async() => {
                    ws.post(`/api/workspaces/${$s.workspace.config.workspace_id}/paths`, {
                        path: [...path, `group_${randomId()}`],
                        value: {},
                    })
                }}
                size="s"
                tip={$t('translation_group.tip.add_group')}
                type="info"
            />
            {!group._collapsed && <Icon
                name="tag_plus_outline"
                onClick={async() => {
                    const id = `tag_${randomId()}`
                    const targetPath = [...path, id]

                    // Create a new tag
                    const {ref} = pathCreate($s.workspace.i18n, targetPath, {
                        source: id,
                        target: {},
                    } as EnolaTag, $s.workspace.config.languages.target)

                    tag_updated(targetPath.join('.'))

                    ws.post(`/api/workspaces/${$s.workspace.config.workspace_id}/paths`, {
                        path: targetPath,
                        value: ref[id],
                    })
                }}
                size="s"
                tip={$t('translation_group.tip.add_tag')}
                type="info"
            />}

            <Icon
                name="translate"
                onClick={async() => {
                    // Translate the group
                    await ws.post(`/api/workspaces/${$s.workspace.config.workspace_id}/translate`, {
                        ignore_cache: $s.env.ctrlKey,
                        path,
                    })
                }}
                size="s"
                tip={$s.env.ctrlKey ? $t('translation.tip.translate_group_force') : $t('translation.tip.translate_group')}
                type={$s.env.ctrlKey ? "danger" : "info"}
            />

            {path.length > 0 && <Icon
                name="trash"
                onClick={async() => {
                    ws.delete(`/api/workspaces/${$s.workspace.config.workspace_id}/paths`, {
                        path,
                    })
                }}
                size="s"
                tip={$t('translation_group.tip.remove_group')}
                type="info"
            />}
        </div>
    </div>
}
