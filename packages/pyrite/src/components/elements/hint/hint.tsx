import {Icon} from '@/components/elements'

interface HintProps {
    text?: string
    class?: string
}

export default function Hint({ text = '', class: className }: HintProps) {
    return (
        <div class={`c-hint ${className || ''}`}>
            <Icon class="item-icon icon-d" name="Info" />
            <div class="description">
                {text}
            </div>
        </div>
    )
}
