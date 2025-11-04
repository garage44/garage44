import classnames from 'classnames'
import {ComponentChildren} from 'preact'
import {useEffect, useRef, useState} from 'preact/hooks'
import './panel-context.css'

interface PanelContextProps {
    children: ComponentChildren
    className?: string | string[]
    collapsed?: boolean
    defaultWidth?: number
    maxWidth?: number
    minWidth?: number
    onCollapseChange?: (collapsed: boolean) => void
    onWidthChange?: (width: number) => void
    width?: number
}

/**
 * PanelContext - Generic right sidebar/panel component
 *
 * Provides a consistent right-side panel layout for contextual content.
 * Supports collapse/expand functionality and horizontal resizing.
 * Width adapts based on content and collapsed state.
 *
 * @example
 * <PanelContext collapsed={false} onCollapseChange={(c) => {...}} width={200} onWidthChange={(w) => {...}}>
 *   <VideoControls />
 *   <VideoStrip streams={streams} />
 * </PanelContext>
 */
export const PanelContext = ({
    children,
    className,
    collapsed = false,
    defaultWidth = 200,
    maxWidth,
    minWidth = 64,
    onCollapseChange,
    onWidthChange,
    width,
}: PanelContextProps) => {
    const panelRef = useRef<HTMLElement>(null)
    const resizerRef = useRef<HTMLDivElement>(null)
    const [isResizing, setIsResizing] = useState(false)
    const currentWidth = width ?? defaultWidth

    useEffect(() => {
        // Only enable resizing when not collapsed and onWidthChange is provided
        if (!panelRef.current || !resizerRef.current || !onWidthChange || collapsed) return

        const panel = panelRef.current
        const resizer = resizerRef.current

        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault()
            setIsResizing(true)

            const startX = e.clientX
            const startWidth = panel.offsetWidth

            const handleMouseMove = (e: MouseEvent) => {
                const diff = startX - e.clientX // Reversed because we're resizing from the left edge
                let newWidth = startWidth + diff

                if (minWidth && newWidth < minWidth) {
                    newWidth = minWidth
                }
                if (maxWidth && newWidth > maxWidth) {
                    newWidth = maxWidth
                }

                panel.style.width = `${newWidth}px`
            }

            const handleMouseUp = () => {
                setIsResizing(false)
                if (panelRef.current) {
                    const finalWidth = panelRef.current.offsetWidth
                    onWidthChange(finalWidth)
                }
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        resizer.addEventListener('mousedown', handleMouseDown)

        return () => {
            resizer.removeEventListener('mousedown', handleMouseDown)
        }
    }, [onWidthChange, minWidth, maxWidth, collapsed])

    return (
        <aside
            ref={panelRef}
            class={classnames(className, 'c-panel-context', 'fade-in', {collapsed, resizing: isResizing})}
            style={{
                gridColumn: 'context',
                width: collapsed ? `${minWidth}px` : `${currentWidth}px`,
            }}
        >
            {onCollapseChange && (
                <button
                    class="collapse-toggle"
                    onClick={() => onCollapseChange(!collapsed)}
                    aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d={collapsed ? 'M6 8l4-4v8l-4-4z' : 'M10 8l-4-4v8l4-4z'} />
                    </svg>
                </button>
            )}
            {onWidthChange && !collapsed && (
                <div ref={resizerRef} class="resize-handle" aria-label="Resize panel" />
            )}
            <div class="content">
                {children}
            </div>
        </aside>
    )
}
