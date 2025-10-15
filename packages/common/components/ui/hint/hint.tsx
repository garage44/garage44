import {Icon} from '../icon/icon'

interface HintProps {
    text?: string
    class?: string
}

export const Hint = ({ text = '', class: className }: HintProps) => {
    return (
        <div class={`c-hint ${className || ''}`}>
            <Icon class="item-icon icon-d" name="info" />
            <div class="description">
                {text}
            </div>
        </div>
    )
}
