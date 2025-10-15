import classnames from 'classnames'
import {ComponentChildren} from 'preact'

interface ButtonGroupProps {
    active: boolean
    children?: ComponentChildren
}

export const ButtonGroup = ({ active, children }: ButtonGroupProps) => {
    return (
        <div class={classnames('c-button-group', { active: active })}>
            {children}
        </div>
    )
}
