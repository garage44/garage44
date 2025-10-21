import {$s} from '@/app'
import {notifier, ws} from '@garage44/common/app'
import {FieldText, Icon} from '@garage44/common/components'
import {$t} from '@garage44/common/app'
import {TranslationResult} from '@/components/elements'
import classnames from 'classnames'

export function Translation({group, path}) {

    const path_update = path.join('.')

    async function translate() {
        const result = await ws.post(`/api/workspaces/${$s.workspace.config.workspace_id}/translate`, {
            path,
            value: group,
        })
        notifier.notify({
            message: $t('translation.message.translated'),
            type: 'success',
        })
    }

    return <div class={classnames('c-translation', {
        redundant: group._redundant,
        soft: group._soft,
        'tag-updated': $s.tags.updated === path_update})}>
        <div class="source">

            <div class="tag-actions">
                <Icon
                    name={group._collapsed ? 'eye_off' : 'eye'}
                    onClick={() => {
                        ws.post(`/api/workspaces/${$s.workspace.config.workspace_id}/collapse`, {
                            path,
                            tag_modifier: {_collapsed: !group._collapsed},
                            value: {_collapsed: !group._collapsed},
                        })
                    }}
                    size="s"
                    tip={$t('translation.tip.translation_view')}
                    type={Object.keys(group.target).length === $s.workspace.config.languages.target.length ? 'success' : 'warning'}
                />
                <Icon
                    name="translate"
                    onClick={translate}
                    size="s"
                    tip={$t('translation.tip.translate')}
                    type="info"
                />
                <Icon
                    name="trash"
                    onClick={async() => {
                        await ws.delete(`/api/workspaces/${$s.workspace.config.workspace_id}/paths`, {path})
                    }}
                    size="s"
                    tip={$t('translation.tip.remove')}
                    type="info"
                />
            </div>

            <FieldText
                className="id-field"
                model={group.$_id}
                onBlur={async() => {
                    const oldPath = [...path]
                    const newPath = [...oldPath.slice(0, -1), group._id]
                    if (oldPath.join('.') !== newPath.join('.')) {
                        await ws.put(`/api/workspaces/${$s.workspace.config.workspace_id}/paths`, {
                            new_path: newPath,
                            old_path: oldPath,
                        })
                    }
                }}
                transform={(modelValue) => {
                    modelValue = modelValue.toLocaleLowerCase().replaceAll(' ', '_')
                    return modelValue
                }}
            />
            <FieldText
                className="src-field"
                model={group.$source}
                onBlur={async() => {
                    await ws.post(`/api/workspaces/${$s.workspace.config.workspace_id}/tags`, {
                        path,
                        source: group.source,
                    })
                }}
                onKeyDown={(event: KeyboardEvent) => {
                    if (event.key === 'Enter' && event.ctrlKey) {
                        translate()
                    } else if (event.key === ' ' && event.ctrlKey) {
                        group._collapsed = !group._collapsed
                    }
                }}
                placeholder={$t('translation.placeholder.translate')}
            />
        </div>
        <TranslationResult group={group} />
    </div>
}
