import {ComponentChildren} from 'preact'
import classnames from 'classnames'

interface SubmenuItem {
    id: string
    label: ComponentChildren
    onClick?: () => void
    active?: boolean
    disabled?: boolean
}

interface SubmenuProps {
    className?: string
    collapsed?: boolean
    items: SubmenuItem[]
}

/**
 * Submenu - A nested menu component for displaying sub-items
 *
 * Used within PanelMenu navigation to show nested menu items.
 * Provides consistent styling with hover and active states.
 *
 * @example
 * <Submenu
 *   collapsed={false}
 *   items={[
 *     { id: 'item1', label: 'Item 1', onClick: () => {}, active: true },
 *     { id: 'item2', label: 'Item 2', onClick: () => {} }
 *   ]}
 * />
 */
export const Submenu = ({className = '', collapsed = false, items}: SubmenuProps) => {
    if (collapsed || !items.length) {
        return null
    }

    return (
        <nav class={classnames('c-submenu', className)}>
            {items.map((item) => (
                <button
                    key={item.id}
                    class={classnames('c-submenu-item', {
                        active: item.active,
                        disabled: item.disabled,
                    })}
                    disabled={item.disabled}
                    onClick={item.onClick}
                    type="button"
                >
                    {item.label}
                </button>
            ))}
        </nav>
    )
}
