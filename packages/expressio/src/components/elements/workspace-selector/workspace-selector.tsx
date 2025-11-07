import {FieldText, Icon} from '@garage44/common/components'
import {$t} from '@garage44/expressio'
import {i18n} from '@/app'
import {DirectoryBrowser} from '../directory-browser/directory-browser'
import type {WorkspaceDescription} from '@/types'
import classnames from 'classnames'

interface WorkspaceSelectorProps {
    workspaces: WorkspaceDescription[]
}

export function WorkspaceSelector({workspaces}: WorkspaceSelectorProps) {
    return <div class="c-workspace-selector">
        <div class="field">
            <div class="label">
                <Icon name="workspace" type="info"/>{$t(i18n.settings.label.workspaces)}
            </div>

            <div class="wrapper">
                <div className="options">
                    {workspaces.map((workspace:WorkspaceDescription) =>
                        <div className={classnames('option', workspace.status)} key={workspace.workspace_id}>
                            <Icon
                                name="close"
                                onClick={() => {
                                    workspaces.splice(0, workspaces.length, ...workspaces.filter((w) => w !== workspace))
                                }}
                                tip={
                                    workspace.status === 'existing' ?
                                        $t(i18n.settings.tip.workspace_existing, {source_file: workspace.source_file}) :
                                        $t(i18n.settings.tip.workspace_new, {source_file: workspace.source_file})
                                }
                                type="info"
                            />
                            {workspace.status === 'new' ? <FieldText
                                autofocus={true}
                                model={workspace.$workspace_id}
                            /> : <div className="label">
                                {workspace.workspace_id}
                            </div>}
                        </div>)}
                </div>
                <DirectoryBrowser
                    onSelect={({path, workspace}) => {
                        workspaces.push({
                            source_file: `${path}/.expressio.json`,
                            status: workspace ? 'existing' : 'new',
                            workspace_id: workspace ? workspace.workspace_id : '',
                        })
                    }}
                />
            </div>

            <div class="help">
                {$t(i18n.settings.help.workspaces)}
            </div>
        </div>
    </div>
}
