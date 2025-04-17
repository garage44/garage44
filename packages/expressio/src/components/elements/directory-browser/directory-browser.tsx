import {Icon} from '@garage44/common/components'
import {classes} from '@garage44/common/lib/utils'
import {deepSignal} from 'deepsignal'
import {mergeDeep} from '@garage44/common/lib/utils'
import {useEffect} from 'preact/hooks'
import {ws} from '@/app'
const state = deepSignal({
    current: {
        path: '',
        workspace: null,
    },
    directories: [],
    loading: false,
    parentPath: '',
})

async function loadDirectory(path = null) {
    state.loading = true
    try {
        const response = await ws.get('/api/workspaces/browse', {
            path,
        })

        mergeDeep(state, {
            current: response.current,
            directories: response.directories,
            parentPath: response.parent,
        })
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load directory:', err)
    }
    state.loading = false
}

export function DirectoryBrowser({onSelect}) {

    useEffect(() => {
        loadDirectory()
    }, [])

    return <div class="c-directory-browser">
        <div class="add-path">
            <Icon
                name="arrow_left_circle_outline"
                onClick={() => onSelect(state.current)}
                tip={() => {
                    if (state.current.workspace) {
                        return "Add directory to workspaces"
                    }
                    return "Create new workspace"
                }}
                type="info"
            />
        </div>
        <div class="wrapper">
            <div class="current-path">{state.current.path}</div>
            <div class="directory-list">
                <div class="directory-item">
                    <div class="directory"
                        onClick={() => loadDirectory(state.parentPath)}
                    >..</div>
                </div>
                {state.directories.map(dir => (
                    <div
                        class={classes("directory", {'is-workspace': dir.is_workspace})}
                        onClick={() => loadDirectory(dir.path)}
                    >{dir.name}</div>
                ))}
            </div>
        </div>
    </div>
}
