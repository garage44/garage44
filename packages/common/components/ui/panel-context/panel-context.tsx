import classnames from 'classnames'
import {ComponentChildren} from 'preact'
import './panel-context.css'

interface PanelContextProps {
    children: ComponentChildren
    collapsed?: boolean
    onCollapseChange?: (collapsed: boolean) => void
}

/**
 * PanelContext - Generic right sidebar/panel component
 *
 * Provides a consistent right-side panel layout for contextual content.
 * Supports collapse/expand functionality.
 * Width adapts based on content and collapsed state.
 *
 * @example
 * <PanelContext collapsed={false} onCollapseChange={(c) => {...}}>
 *   <VideoControls />
 *   <VideoStrip streams={streams} />
 * </PanelContext>
 */
export const PanelContext = ({
    children,
    collapsed = false,
    onCollapseChange,
}: PanelContextProps) => {
    return (
        <aside class={classnames('c-panel-context', 'fade-in', {collapsed})} style={{gridColumn: 'context'}}>
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
            <div class="content">
                {children}
            </div>
        </aside>
    )
}
