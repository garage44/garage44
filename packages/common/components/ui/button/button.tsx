import {useEffect, useRef, useState} from 'preact/hooks'
import {Icon} from '@/components'
import type {Instance as TippyInstance} from 'tippy.js'
import type {ComponentChildren} from 'preact'
import classnames from 'classnames'
import tippy from 'tippy.js'
import {Link} from 'preact-router'

export interface ButtonContextConfig {
    enabled: boolean
    placeholder: string
    submit: (text: string) => void
}

export interface ButtonProps {
    active?: boolean
    children?: ComponentChildren
    class?: string
    className?: string
    context?: ButtonContextConfig
    disabled?: boolean
    icon?: string
    iconProps?: Record<string, any>
    label?: string
    onClick?: (event: MouseEvent) => void
    route?: string
    size?: 's' | 'm' | 'l'
    tip?: string
    type?: 'default' | 'success' | 'info' | 'warning' | 'danger'
    variant?: 'default' | 'toggle' | 'menu' | 'unset'
}

// Helper function to get DOM element from Preact ref
// Handles both direct DOM elements and Preact component instances
function getDOMElement(ref: unknown): HTMLElement | null {
    if (!ref) return null

    if (ref instanceof HTMLElement) {
        // Direct DOM element (from <button>)
        return ref
    }

    if (ref && typeof ref === 'object' && 'base' in ref) {
        // Preact component instance (from <Link>)
        const base = (ref as {base?: HTMLElement}).base
        if (base instanceof HTMLElement) {
            return base
        }
    }

    return null
}

export function Button({
    active = false,
    children = null,
    class: classProp = '',
    className = '',
    context = null,
    disabled = false,
    icon = null,
    iconProps = {},
    label = '',
    onClick,
    route = null,
    size = 'm',
    tip = '',
    type = 'default',
    variant = 'default',
}: ButtonProps) {
    const buttonRef = useRef(null)
    const tippyInstanceRef = useRef<TippyInstance | null>(null)
    const [contextTriggered, setContextTriggered] = useState(false)
    const [contextText, setContextText] = useState('')

    useEffect(() => {
        // Initialize or update tippy when tip changes or component mounts
        const domElement = getDOMElement(buttonRef.current)

        if (!domElement) return

        if (tippyInstanceRef.current) {
            // Update existing tippy instance
            if (tip) {
                tippyInstanceRef.current.setContent(tip)
                tippyInstanceRef.current.enable()
            } else {
                tippyInstanceRef.current.disable()
            }
        } else if (tip) {
            // Initialize tippy if tip is available
            tippyInstanceRef.current = tippy(domElement, {
                allowHTML: true,
                arrow: true,
                content: tip,
            })
        }

        return () => {
            if (tippyInstanceRef.current) {
                tippyInstanceRef.current.destroy()
                tippyInstanceRef.current = null
            }
        }
    }, [tip]) // Include tip in dependencies to handle both initialization and updates

    const handleClick = (event: MouseEvent) => {
        if (disabled) {
            return
        }

        // Handle context menu
        if (context && !contextTriggered) {
            if (context.enabled) {
                setContextTriggered(true)
                return
            }
            // No context action; just submit with empty text
            context.submit(contextText)
        }

        // Regular click handler
        if (onClick) {
            onClick(event)
        }
    }

    const handleContextSubmit = () => {
        if (context) {
            context.submit(contextText)
            setContextTriggered(false)
            setContextText('')
        }
    }

    const finalClassName = classnames(
        'c-button',
        `type-${type}`,
        `variant-${variant}`,
        `size-${size}`,
        className,
        classProp,
        {
            active,
            disabled,
        },
    )

    const buttonContent = (
        <>
            {icon && <Icon name={icon} type="unset" {...iconProps} />}
            {label && <span class="label">{label}</span>}
            {children}

            {context && (
                <div
                    class={classnames('context-submit', {active: contextTriggered})}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setContextTriggered(false)
                        }
                    }}
                >
                    <button
                        class="btn-context-submit"
                        onClick={handleContextSubmit}
                    >
                        <Icon name="check" type="unset" />
                    </button>
                    <textarea
                        class="context-input"
                        placeholder={context.placeholder}
                        value={contextText}
                        onInput={(e) => setContextText((e.target as HTMLTextAreaElement).value)}
                    />
                </div>
            )}
        </>
    )

    // If route is provided, render as Link
    if (route) {
        // Preact-router Link accepts href but TypeScript types may not reflect this
        return (
            <Link
                ref={buttonRef}
                class={finalClassName}
                {...({href: route, onClick: handleClick} as Record<string, unknown>)}
            >
                {buttonContent}
            </Link>
        )
    }

    // Otherwise, render as button
    return (
        <button
            ref={buttonRef}
            class={finalClassName}
            disabled={disabled}
            onClick={handleClick}
        >
            {buttonContent}
        </button>
    )
}
