import classnames from 'classnames'
import {ComponentChildren} from 'preact'

interface ButtonGroupProps {
    active: boolean
    children?: ComponentChildren
}

export default function ButtonGroup({ active, children }: ButtonGroupProps) {
    return (
        <div class={classnames('c-button-group', { active: active })}>
            {children}
        </div>
    )
}
