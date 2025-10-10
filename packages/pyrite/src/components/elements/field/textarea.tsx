import {useEffect, useRef, useState} from 'preact/hooks'

interface FieldTextareaProps {
    value: string
    onChange: (value: string) => void
    label?: string
    placeholder?: string
    help?: string
    autofocus?: boolean
}

export default function FieldTextarea({ value, onChange, label, placeholder = '', help, autofocus }: FieldTextareaProps) {
    const [uniqueId] = useState(() => Math.random().toString(36).substr(2, 9))
    const fieldRef = useRef<HTMLTextareaElement>(null)

    const handleInput = (e: Event) => {
        onChange((e.target as HTMLTextAreaElement).value)
    }

    const handleKeydown = (e: KeyboardEvent) => {
        e.stopPropagation()
    }

    useEffect(() => {
        if (autofocus && fieldRef.current) {
            fieldRef.current.focus()
        }
    }, [autofocus])

    return (
        <div class="c-field-textarea field">
            {label && <label class="field-label" for={uniqueId}>{label}</label>}
            <textarea
                ref={fieldRef}
                id={uniqueId}
                value={value}
                placeholder={placeholder}
                onInput={handleInput}
                onKeyDown={handleKeydown}
            />
            {help && <div class="help">{help}</div>}
        </div>
    )
}
