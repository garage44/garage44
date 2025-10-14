import classnames from 'classnames'
import {IconLogo} from '@/components/elements'
import {Link} from 'preact-router'
import {useEffect, useRef, useMemo} from 'preact/hooks'
import {ComponentChildren} from 'preact'
import {$s} from '@/app'
import animate from '@/lib/animate'

interface PanelContextProps {
    children?: ComponentChildren
}

export default function PanelContext({ children }: PanelContextProps) {
    const panelRef = useRef<HTMLDivElement>(null)
    const version = process.env.APP_VERSION || '2.0.0'

    const toggleContext = useMemo(() => {
        const pathname = window.location.pathname

        if (pathname === '/') {
            return '/admin/groups'
        } else if (pathname.startsWith('/groups/') && $s.group.connected) {
            return '/admin/groups'
        } else if (pathname.startsWith('/groups/')) {
            // Use the selected group with the group in admin.
            const groupId = $s.group.name
            return `/admin/groups/${groupId}/misc`
        } else if (pathname.startsWith('/admin/groups')) {
            if ($s.group.connected) {
                const groupId = $s.group.name
                return `/groups/${groupId}`
            } else {
                const groupId = $s.group.name
                if (!groupId) {
                    return '/'
                } else {
                    return `/groups/${groupId}`
                }
            }
        }
        return '/'
    }, [window.location.pathname, $s.group.connected, $s.group.name])

    // Watch for panel collapse changes
    useEffect(() => {
        if (!panelRef.current) return

        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
        const currentWidth = panelRef.current.offsetWidth
        const targetWidth = $s.panels.context.collapsed ? rootFontSize * 2.5 : 250 // 2.5rem = --spacer-5

        animate({
            duration: 350,
            from: currentWidth,
            onUpdate: v => {
                if (panelRef.current) {
                    panelRef.current.style.width = `${Math.floor(v)}px`
                }
            },
            to: targetWidth,
        })
    }, [$s.panels.context.collapsed])

    // Watch for layout changes
    useEffect(() => {
        if ($s.env.layout === 'tablet') {
            $s.panels.context.collapsed = true
        }
    }, [$s.env.layout])

    return (
        <div ref={panelRef} class={classnames('c-panel-context', {collapsed: $s.panels.context.collapsed})}>
            <header>
                {!$s.group.connected ? (
                    <Link class="logo" href={toggleContext}>
                        <svg class="icon" viewBox="0 0 24 24" height="40" width="40">
                            <IconLogo />
                        </svg>
                        <div class="l-name">
                            <div class="name">
                                PYRITE
                            </div>
                            <div class="version">
                                {version}
                            </div>
                        </div>
                    </Link>
                ) : (
                    <span class="logo">
                        <svg class="icon" viewBox="0 0 24 24" height="40" width="40">
                            <IconLogo />
                        </svg>
                        <div class="l-name">
                            <div class="name">
                                PYRITE
                            </div>
                            <div class="version">
                                {version}
                            </div>
                        </div>
                    </span>
                )}
            </header>
            {children}
        </div>
    )
}
