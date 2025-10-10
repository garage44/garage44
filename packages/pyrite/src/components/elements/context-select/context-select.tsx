import {FieldSelect, Icon} from '@/components/elements'
import {useState, useEffect, useRef} from 'preact/hooks'

interface ContextSelectProps {
    value: any
    onChange?: (value: any) => void
    icon: string
    title: string
    options: any[]
    submit: (value: any) => void | Promise<void>
}

export default function ContextSelect({ value, onChange, icon, title, options, submit }: ContextSelectProps) {
    const [input, setInput] = useState(false)
    const [model, setModel] = useState(value)
    const selectRef = useRef<any>(null)

    const buttonAction = async () => {
        setInput(prev => !prev)
        if (selectRef.current?.toggleSelect) {
            selectRef.current.toggleSelect(null, null, true)
        }
    }

    const submitMethod = async () => {
        await submit(model)
        setInput(false)
        if (onChange) {
            onChange(model)
        }
    }

    // Watch for model changes
    useEffect(() => {
        if (input) {
            submitMethod()
        }
    }, [model])

    return (
        <div class="c-context-select">
            <button class="action" onClick={(e) => {
                e.stopPropagation()
                buttonAction()
            }}>
                <Icon class="icon icon-s" name={icon} />
                <span>{title}</span>
            </button>

            {input && (
                <FieldSelect
                    ref={selectRef}
                    value={model}
                    onChange={setModel}
                    options={options}
                />
            )}
        </div>
    )
}
