import {FieldCheckbox} from '@/components'
import classnames from 'classnames'

export const FieldCheckboxGroup = ({children, className, label, model: options}) =>
    <div class={classnames('c-field-checkbox-group', 'field', className)}>
        {label && <div class="label">{label}</div>}
        <div class="options">
            {options.map((option) => [
                <FieldCheckbox
                    key={option.label}
                    label={option.label}
                    model={option.value}
                />,
                children,
            ])}
        </div>
    </div>
