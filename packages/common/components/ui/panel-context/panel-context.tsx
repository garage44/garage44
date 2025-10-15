import classnames from 'classnames'
import {useEffect, useRef, useMemo} from 'preact/hooks'
import {ComponentChildren} from 'preact'

interface PanelContextProps {
    children?: ComponentChildren
    collapsed: boolean
    onCollapseChange?: (collapsed: boolean) => void
    logoHref?: string
    logoText?: string
    logoVersion?: string
    LogoIcon?: () => JSX.Element
    LinkComponent?: any
    animate?: (config: any) => void
}

export const PanelContext = ({
    children,
    collapsed,
    onCollapseChange,
    logoHref,
    logoText = '',
    logoVersion = '',
    LogoIcon,
    LinkComponent,
    animate
}: PanelContextProps) => {
    const panelRef = useRef<HTMLDivElement>(null)

    // Watch for panel collapse changes
    useEffect(() => {
        if (!panelRef.current || !animate) return

        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
        const currentWidth = panelRef.current.offsetWidth
        const targetWidth = collapsed ? rootFontSize * 2.5 : 250 // 2.5rem = --spacer-5

        animate({
            duration: 350,
            from: currentWidth,
            onUpdate: (v: number) => {
                if (panelRef.current) {
                    panelRef.current.style.width = `${Math.floor(v)}px`
                }
            },
            to: targetWidth,
        })
    }, [collapsed, animate])

    const renderLogo = () => {
        const logoContent = (
            <>
                {LogoIcon && (
                    <svg class="icon" viewBox="0 0 24 24" height="40" width="40">
                        <LogoIcon />
                    </svg>
                )}
                <div class="l-name">
                    {logoText && <div class="name">{logoText}</div>}
                    {logoVersion && <div class="version">{logoVersion}</div>}
                </div>
            </>
        )

        if (LinkComponent && logoHref) {
            return (
                <LinkComponent class="logo" href={logoHref}>
                    {logoContent}
                </LinkComponent>
            )
        } else {
            return <span class="logo">{logoContent}</span>
        }
    }

    return (
        <div ref={panelRef} class={classnames('c-panel-context', {collapsed})}>
            <header>
                {renderLogo()}
            </header>
            {children}
        </div>
    )
}
