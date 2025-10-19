import {FieldCheckbox} from '@/components'
import classnames from 'classnames'

export const FieldCheckboxGroup = ({children, className, model: options}) =>
    <div class={classnames('c-field-checkbox-group', 'field', className)}>
        {options.map((option) => [
            <FieldCheckbox
                key={option.label}
                label={option.label}
                model={option.value}
            />,
            children,
        ])}
    </div>
