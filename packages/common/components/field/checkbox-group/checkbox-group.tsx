import {FieldCheckbox} from '@/components'
import {classes} from '../../../lib/utils'

export const FieldCheckboxGroup = ({children, className, model: options}) =>
    <div class={classes('c-field-checkbox-group', 'field', className)}>
        {options.map((option) => [
            <FieldCheckbox key={option.label} model={option} />,
            children,
        ])}
    </div>
