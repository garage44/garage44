import {classes} from '../../../lib/utils'

interface FieldUploadProps {
    className?: string
    disabled?: boolean
    label?: string
    help?: string
    model: [any, string]
    onBlur?: (event: Event) => void
    onClick?: (event: Event) => void
    accept?: string
    placeholder?: string
    transform?: (value: string) => string
}

export function FieldUpload({
    className = '',
    disabled = false,
    label = '',
    help = '',
    model,
    onBlur = null,
    onClick = null,
    accept = '*',
    placeholder = 'Choose a file...',
    transform = null,
}: FieldUploadProps) {
    return (
        <div class={classes('c-field-upload', 'field', className)}>
            {!!label && <label for="" class="label">{label}</label>}
            <div class="upload-wrapper">
                <input
                    disabled={disabled}
                    onClick={(event) => {
                        if (onClick) {
                            onClick(event)
                        }
                    }}
                    onBlur={(event) => {
                        if (onBlur) {
                            onBlur(event)
                        }
                    }}
                    onChange={(event) => {
                        const target = event.target as HTMLInputElement
                        if (target.files && target.files.length > 0) {
                            let value = target.files[0].path
                            if (transform) {
                                value = transform(value)
                            }
                            model[0][model[1]] = value
                        }
                    }}
                    placeholder={placeholder}
                    type="file"
                    accept={accept}
                />
                <div class="file-path">{model[0][model[1]] || placeholder}</div>
            </div>
            {help && <div class="help">{help}</div>}
        </div>
    )
}
