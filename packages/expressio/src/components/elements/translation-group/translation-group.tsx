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

function groupMatchesFilter(group: TranslationGroupType, id: string, filter: string): boolean {
    const filterLower = filter.toLowerCase()
    // Match id
    if (id.toLowerCase().includes(filterLower)) return true
    // Match source
    if (typeof group.source === 'string' && group.source.toLowerCase().includes(filterLower)) return true
    // Match any translation value
    if (group.target && typeof group.target === 'object') {
        for (const val of Object.values(group.target)) {
            if (typeof val === 'string' && val.toLowerCase().includes(filterLower)) return true
        }
    }
    // Recursively check subgroups
    for (const [subId, subGroup] of Object.entries(group)) {
        if (!subId.startsWith('_') && typeof subGroup === 'object' && groupMatchesFilter(subGroup as TranslationGroupType, subId, filter)) {
            return true
        }
    }
    return false
}

export function TranslationGroup({group, level = 0, path, filter = '', sort = 'asc'}: {
    group: TranslationGroupType
    level?: number
    path: string[]
    filter?: string
    sort?: 'asc' | 'desc'
}) {
    // Determine if this group matches the filter
    const groupItselfMatches = filter ? groupMatchesFilter(group, group._id || path[path.length - 1] || '', filter) : true

    // At each level, only show entries that match or have matching descendants
    let entries: [string, unknown][] = Object.entries(group)
        .filter(([id, subGroup]) => {
            if (id.startsWith('_')) return false
            if (!filter) return true
            // If this group matches, show all its children
            if (groupItselfMatches && level > 0) return true
            // Otherwise, only show entries that match or have matching descendants
            return groupMatchesFilter(subGroup as TranslationGroupType, id, filter)
        })
        .sort(([idA], [idB]) => {
            return sort === 'asc' ? idA.localeCompare(idB) : idB.localeCompare(idA)
        })

    // If filter is active, auto-expand groups with matches
    const autoExpand = !!filter
    const collapsed = autoExpand ? false : group._collapsed

    return <div class={classes('c-translation-group', `level-${level}`, {
        collapsed,
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
            {entries.map(([id, subGroup]) => {
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
                    filter={filter}
                    sort={sort}
                />
            })}
        </div>
    </div>
}
