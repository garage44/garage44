import classnames from 'classnames'
import {Icon} from '@/components/elements'
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

        const spacer = Number(getComputedStyle(document.querySelector('.app')!).getPropertyValue('--spacer').replace('px', ''))
        animate({
            duration: 350,
            from: $s.panels.context.collapsed ? 300 : spacer * 8,
            onFinish: () => {},
            onUpdate: v => {
                if (panelRef.current) {
                    panelRef.current.style.width = `${Math.floor(v)}px`
                }
            },
            to: $s.panels.context.collapsed ? spacer * 8 : 300,
        })
    }, [$s.panels.context.collapsed])

    // Watch for layout changes
    useEffect(() => {
        if ($s.env.layout === 'tablet') {
            $s.panels.context.collapsed = true
        }
    }, [$s.env.layout])

    return (
        <div ref={panelRef} class={classnames('c-panel-context', {collapsed: false})}>
            <header>
                {!$s.group.connected ? (
                    <Link class="logo" href={toggleContext}>
                        <Icon class="icon" name="Logo" />
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
                        <Icon class="icon" name="Logo" />
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
