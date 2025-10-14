import {FieldText, Icon} from '@/components/elements'
import {useState, useMemo} from 'preact/hooks'
import {$t} from '@garage44/common/app'

interface ContextInputProps {
    value: {
        icon?: string | (() => string)
        title?: string | (() => string)
    }
    submit: (text: string) => void | Promise<void>
    required?: boolean
    revert?: boolean
}

export default function ContextInput({ value, submit, required = true, revert = false }: ContextInputProps) {
    const [input, setInput] = useState(false)
    const [inputTransition, setInputTransition] = useState(false)
    const [text, setText] = useState('')

    const _icon = useMemo(() => {
        if (!value.icon) return 'Kick'
        if (typeof value.icon === 'string') return value.icon
        return value.icon()
    }, [value.icon])

    const _title = useMemo(() => {
        if (!value.title) return null
        if (typeof value.title === 'string') return value.title
        return value.title()
    }, [value.title])

    const buttonAction = () => {
        if (revert) {
            submitMethod()
        } else {
            setInput(prev => !prev)
        }
    }

    const inputTransitioned = () => {
        setInputTransition(input)
    }

    const submitMethod = async () => {
        await submit(text)
        // Reset text and hide input again.
        setInput(false)
        setText('')
    }

    return (
        <div class="c-context-input">
            {input && !revert ? (
                <div class="action-input">
                    <FieldText
                        value={text}
                        onChange={setText}
                        autofocus={inputTransition}
                        onKeyUp={(e: KeyboardEvent) => {
                            if (e.key === 'Enter') submitMethod()
                        }}
                    />

                    {required && text === '' ? (
                        <button class="btn" onClick={() => setInput(!input)}>
                            <Icon
                                class="icon icon-s"
                                name="Close"
                            />
                        </button>
                    ) : (
                        <button class="btn" onClick={submitMethod}>
                            <Icon
                                class="icon icon-s"
                                name="Send"
                            />
                        </button>
                    )}
                </div>
            ) : _title ? (
                <button class="action" onClick={buttonAction}>
                    <Icon
                        class="icon icon-s"
                        name={_icon}
                    />
                    {_title && <span>{_title}</span>}
                </button>
            ) : null}
        </div>
    )
}
