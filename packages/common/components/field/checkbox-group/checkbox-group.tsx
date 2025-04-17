import {FieldCheckbox} from '@/components'
import {classes} from '../../../lib/utils'

export const FieldCheckboxGroup = ({children, className, model: options}) => {
    return <div class={classes('c-field-checkbox-group', 'field', className)}>
        {options.map((option) => {
            return [
                <FieldCheckbox model={option} />,
                children,
            ]
        })}
    </div>
}
