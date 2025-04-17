import {$s, ws} from '@/app'
import {FieldText} from '@garage44/common/components'
import {GroupActions} from '../group-actions/group-actions'
import {Translation} from '@/components/elements'
import {classes} from '@garage44/common/lib/utils'
import {pathHas} from '@garage44/common/lib/paths'
import {tag_updated} from '@/lib/ui'

interface TranslationGroupType {
    _id: string
    source?: string
    [key: string]: unknown
}

export function TranslationGroup({group, level = 0, path}: {
    group: TranslationGroupType
    level?: number
    path: string[]
}) {

    return <div class={classes('c-translation-group', `level-${level}`, {
        collapsed: group._collapsed,
        'has-redundant': pathHas($s.workspace.i18n, path, '_redundant'),
        'has-soft': pathHas($s.workspace.i18n, path, '_soft'),
        'tag-updated': $s.tags.updated === path.join('.')},
    )}>
        <div class="group-id">
            {level > 0 && <GroupActions className="vertical" group={group} path={path}/>}

            {path.length > 0 && <FieldText
                className="group-field"
                model={group.$_id}
                onBlur={async() => {
                    const oldPath = path
                    const newPath = [...path.slice(0, -1), group._id]
                    if (oldPath.join('.') !== newPath.join('.')) {
                        ws.put(`/api/workspaces/${$s.workspace.config.workspace_id}/paths`, {
                            new_path: newPath,
                            old_path: oldPath,
                        })
                    }
                    tag_updated(newPath.join('.'))
                }}
                transform={(value) => value.toLocaleLowerCase().replaceAll(' ', '_')}
            />}

        </div>
        <div class="group-value">
            {group && Object.entries(group)
                .filter(([id]) => !id.startsWith('_'))
                .sort(([idA, groupA], [idB, groupB]) => {
                    const a = groupA as TranslationGroupType
                    const b = groupB as TranslationGroupType
                    if (!('source' in a)) {
                        return 1
                    } else if (!('source' in b)) {
                        return -1
                    } else {
                        return idA.localeCompare(idB)
                    }
                })
                .map(([id, subGroup]) => {
                    const typedSubGroup = subGroup as TranslationGroupType
                    if ('source' in typedSubGroup) {
                        return <Translation
                            group={typedSubGroup}
                            path={[...path, id]}
                        />
                    }

                    return <TranslationGroup
                        level={level + 1}
                        group={typedSubGroup}
                        path={[...path, id]}
                    />
                })
            }
        </div>
    </div>
}
