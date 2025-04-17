import {classes, randomId} from '@/lib/utils'

export const FieldCheckbox = ({
    className = '',
    help = '',
    label,
    model,
    onInput,
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
