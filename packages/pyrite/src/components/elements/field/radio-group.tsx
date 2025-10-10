import {$t} from '@/app'

interface FieldRadioGroupProps {
    value: string
    onChange: (value: string) => void
    options: [string, string][]  // [value, label] tuples
    label?: string
    help?: string
}

export default function FieldRadioGroup({ value, onChange, options, label, help }: FieldRadioGroupProps) {
    const updateModel = (event: Event) => {
        onChange((event.target as HTMLInputElement).value)
    }

    return (
        <div class="c-field-radio-group field">
            <div class="checkbox-row">
                {label && <div class="field-label">{label}</div>}
            </div>
            <div class="options">
                {options.map((option) => (
                    <div key={option[0]} class="option">
                        <input
                            id={option[0]}
                            checked={option[0] === value}
                            name="same"
                            type="radio"
                            value={option[0]}
                            onInput={updateModel}
                        />
                        <label for={option[0]}>{$t(option[1])}</label>
                    </div>
                ))}
            </div>
            {help && <div class="help">{help}</div>}
        </div>
    )
}
