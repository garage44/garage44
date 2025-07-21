import {useEffect, useRef} from 'preact/hooks'
import {Icon} from '@garage44/common/components'
import type {Instance as TippyInstance} from 'tippy.js'
import {classes} from '@/lib/utils'
import {signal} from '@preact/signals'
import tippy from 'tippy.js'

export function Button({
    className = '',
    disabled = false,
    icon = null,
    label = '',
    onClick,
    tip = '',
    type = 'default',
}) {
    const buttonRef = useRef(null)
    const tippyInstanceRef = useRef<TippyInstance | null>(null)
    const tipSignal = signal(tip)

    useEffect(() => {
        if (buttonRef.current && tipSignal.value) {
            tippyInstanceRef.current = tippy(buttonRef.current, {
                allowHTML: true,
                arrow: true,
                content: tipSignal.value,
            })
        }
        return () => {
            if (tippyInstanceRef.current) {
                tippyInstanceRef.current.destroy()
            }
        }
    }, [])

    useEffect(() => {
        tipSignal.value = tip
        if (tippyInstanceRef.current) {
            if (tip) {
                tippyInstanceRef.current.setContent(tip)
                tippyInstanceRef.current.enable()
            } else {
                tippyInstanceRef.current.disable()
            }
        }
    }, [tip])

    return <button
        ref={buttonRef}
        class={classes('c-button', `type-${type}`, className, {
            disabled,
        })}
        disabled={disabled}
        onClick={(event) => {
            if (disabled) {
                return
            }
            if (onClick) {
                onClick(event)
            }
        }}
    >

        {icon && <Icon name={icon}/>}
        {label}
    </button>
}
