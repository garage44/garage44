import {classes, randomId} from '@/lib/utils'

export const FieldCheckbox = ({
    className = '',
    help = '',
    label,
    model,
    onInput,
}: {
    className?: string
    help?: string
    label: string
    model: boolean
    onInput?: (value: boolean) => void
}) => {
    const id = randomId()

    return <div class={classes('c-field-checkbox', 'field', className)}>
        <div class="wrapper">
            <input
                checked={model}
                id={id}
                type="checkbox"
                onInput={() => {
                    model.value = !model.value
                    if (onInput) {
                        onInput(model.value)
                    }
                }}
                value={model}
            />
            <label for={id} class="label">{label}</label>
        </div>
        {help && <div class="help">{help}</div>}
    </div>
}
