import {create$t, init as i18nInit} from './lib/i18n'
import {Api} from './lib/api'
import type {CommonState} from './types'
import {EventEmitter} from 'node:events'
import {Notifier} from './lib/notifier'
import {Store} from './lib/store'
import env from './lib/env'
import {logger} from './lib/logger'
import {WebSocketClient} from './lib/ws-client'
import {persistentState, volatileState} from './lib/state'
logger.setLevel('debug')

const notifier = new Notifier()
const store = new Store<CommonState>()
store.load(persistentState as unknown as CommonState, volatileState as Partial<CommonState>)
const $t = create$t(store)

// Create i18n object with init function
const i18n = {
    init: i18nInit,
}

const api = new Api()
const events = new EventEmitter()

// Helper function to construct WebSocket URL based on current protocol
function getWebSocketUrl(path: string): string {
    const protocol = globalThis?.location?.protocol === 'https:' ? 'wss:' : 'ws:'
    const hostname = globalThis?.location?.hostname || 'localhost'
    const port = (globalThis as any)?.location?.port
    // Only include port if it's explicitly set and not the default (80 for HTTP, 443 for HTTPS)
    // When behind Nginx with SSL, the port will be empty (defaults to 443) and Nginx will proxy to backend
    const portSuffix = port && port !== '80' && port !== '443' ? `:${port}` : ''
    return `${protocol}//${hostname}${portSuffix}${path}`
}

const ws = new WebSocketClient(getWebSocketUrl('/ws'))

interface InitOptions {
    enableBunchy?: boolean
}


class App {

    async init(Main, renderFn, hFn, translations, options: InitOptions = {}) {
        // Check if this is an HMR update
        const flagValue = (globalThis as any).__HMR_UPDATING__
        const isHMRUpdate = flagValue === true
        // oxlint-disable-next-line no-console
        console.log('[App.init] HMR flag check:', {flagType: typeof flagValue, flagValue, globalThisKeys: Object.keys(globalThis).filter((k) => k.includes('HMR')), isHMRUpdate})

        if (isHMRUpdate) {
            // oxlint-disable-next-line no-console
            console.log('[HMR] Using HMR code path - skipping initialization, just re-rendering')

            // During HMR, skip all initialization and just update the Main component reference
            // Note: data-hmr-updating attribute is already set by bunchy/client.ts before script loads
            store.state.hmr_updating = true
            ;(globalThis as any).__HMR_UPDATING__ = false

            // Ensure data attribute is set (should already be set, but be safe)
            if (!document.body.dataset.hmrUpdating) {
                document.body.dataset.hmrUpdating = 'true'
            }

            // Update Main component reference
            if (globalThis !== undefined) {
                ;(globalThis as any).__HMR_MAIN_COMPONENT__ = Main
            }

            // Use the NEW render functions from this script (not the old ones)
            // This ensures Preact hooks work correctly with the new Preact instance
            // oxlint-disable-next-line no-console
            console.log('[HMR] Using new render functions from current script')

            // Preserve scroll position before re-render
            const viewElement = document.querySelector('.view')
            const scrollPosition = viewElement ? viewElement.scrollTop : 0
            // oxlint-disable-next-line no-console
            console.log('[HMR] Preserving scroll position:', scrollPosition)

            // Sync route state to prevent menu flash
            // Use store.state.env.url which is maintained by the env system
            // This ensures currentRoute matches the actual URL before Router initializes
            try {
                const currentUrl = store.state.env?.url || globalThis.location?.pathname || '/'
                if ('currentRoute' in store.state && (store.state as any).currentRoute !== currentUrl) {
                    ;(store.state as any).currentRoute = currentUrl
                    // oxlint-disable-next-line no-console
                    console.log('[HMR] Synced route state to:', currentUrl)
                }
            } catch (error) {
                // If env.url access fails (shouldn't happen, but be safe), use window.location
                // oxlint-disable-next-line no-console
                console.warn('[HMR] Could not sync route state:', error)
            }

            try {
                // Re-render with the new Main component using the NEW render/h functions
                // This ensures Preact hooks are from the same instance as the component
                // oxlint-disable-next-line no-console
                console.log('[HMR] Re-rendering Main component')

                // Preact's render() should update the existing tree when called on the same container
                // To ensure changes are visible, we render null first to unmount the old tree,
                // then render the new component. This is safer than clearing innerHTML.
                const rootElement = document.body.firstElementChild

                if (rootElement) {
                    // Ensure HMR flags are set BEFORE unmounting to prevent animations
                    // Data attribute should already be set by bunchy/client.ts, but ensure state is set
                    store.state.hmr_updating = true
                    document.body.dataset.hmrUpdating = 'true'

                    // oxlint-disable-next-line no-console
                    console.log('[HMR] Data attribute check:', document.body.dataset.hmrUpdating)

                    // Wait a microtask to ensure state propagates
                    await new Promise((resolve) => setTimeout(resolve, 0))

                    // Unmount the old tree by rendering null
                    // oxlint-disable-next-line no-console
                    console.log('[HMR] Unmounting old tree')
                    renderFn(null, document.body)

                    // Wait a tick for Preact to complete unmounting
                    await new Promise((resolve) => setTimeout(resolve, 0))
                }

                // Render the new component - Preact will create a fresh tree
                const vnode = hFn(Main, {})
                // oxlint-disable-next-line no-console
                console.log('[HMR] Rendering new vnode:', vnode)
                const result = renderFn(vnode, document.body)
                // oxlint-disable-next-line no-console
                console.log('[HMR] Render result:', result)

                // Verify the component was actually rendered
                if (!document.body.firstElementChild) {
                    // oxlint-disable-next-line no-console
                    console.error('[HMR] Component was not rendered to DOM, falling back to reload')
                    globalThis.location.reload()
                    return
                }

                // Update global references for next HMR update
                if (globalThis !== undefined) {
                    ;(globalThis as any).__HMR_RENDER_FN__ = renderFn
                    ;(globalThis as any).__HMR_H_FN__ = hFn
                }

                // Restore scroll position after render
                requestAnimationFrame(() => {
                    const newViewElement = document.querySelector('.view')
                    if (newViewElement) {
                        newViewElement.scrollTop = scrollPosition
                        // oxlint-disable-next-line no-console
                        console.log('[HMR] Restored scroll position:', scrollPosition)
                    }
                })
            } catch (error) {
                // oxlint-disable-next-line no-console
                console.error('[HMR] Error re-rendering Main component:', error)
                // Fall back to full reload on error
                globalThis.location.reload()
                return
            }

            // Reset HMR flag after render completes
            setTimeout(() => {
                store.state.hmr_updating = false
                // oxlint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete document.body.dataset.hmrUpdating
                // oxlint-disable-next-line no-console
                console.log('[HMR] HMR update complete')
            }, 0)

            return // Don't emit app:init or do any initialization
        }

        // oxlint-disable-next-line no-console
        console.log('[App] Normal initialization path')

        // Normal initialization (not HMR)
        env(store.state.env, store)
        await i18n.init(translations, api, store)
        notifier.init(store.state.notifications)

        // Store references for HMR re-rendering
        if (globalThis !== undefined) {
            ;(globalThis as any).__HMR_MAIN_COMPONENT__ = Main
            ;(globalThis as any).__HMR_RENDER_FN__ = renderFn
            ;(globalThis as any).__HMR_H_FN__ = hFn
        }

        try {
            renderFn(hFn(Main, {}), document.body)
        } catch (error) {
            // oxlint-disable-next-line no-console
            console.error('Error rendering Main component:', error)
        }

        events.emit('app:init')
    }
}

export {
    $t,
    api,
    App,
    events,
    logger,
    i18n,
    notifier,
    store,
    ws,
}