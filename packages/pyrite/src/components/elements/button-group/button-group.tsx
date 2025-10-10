import {classes} from '@garage44/common/lib/utils'
import {ComponentChildren} from 'preact'

interface ButtonGroupProps {
    active: boolean
    children?: ComponentChildren
}

export default function ButtonGroup({ active, children }: ButtonGroupProps) {
    return (
        <div class={classes('c-button-group', { active: active })}>
            {children}
        </div>
    )
}
