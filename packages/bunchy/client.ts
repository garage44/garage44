import {WebSocketClient} from '@garage44/common/lib/ws-client'
import {logger} from '@garage44/common/lib/logger'

// Keep track of which stylesheets are currently being updated
const pendingStylesheetUpdates = new Set<string>()

// Exception page state
let exceptionOverlay: HTMLElement | null = null

function updateStylesheet(filename: string, publicPath: string) {
    // Skip if this stylesheet is already being updated
    if (pendingStylesheetUpdates.has(filename)) {
        return
    }

    // Mark this stylesheet as being updated
    pendingStylesheetUpdates.add(filename)

    // Get all stylesheet links
    const allLinks = [...document.querySelectorAll(`link[rel=stylesheet]`)]
        .map((link) => link as HTMLLinkElement)

    // Find matching stylesheet by base name (without hash)
    const baseFileName = filename.split('.')[0] // Extract 'app' from 'app.axuasllor.css'
    const linkElements = allLinks.filter(link => {
        const href = link.href
        // Match /public/app.*.css or /public/components.*.css pattern
        const pattern = new RegExp(`/public/${baseFileName}\\.[^/]*\\.css`)
        return pattern.test(href)
    })

    if (linkElements.length === 0) {
        pendingStylesheetUpdates.delete(filename)
        return
    }

    // Create new stylesheet link - use public path since static files are served from /public/
    const newLink = document.createElement('link')
    newLink.rel = 'stylesheet'
    newLink.href = `/public/${filename}?${Date.now()}`

    // When the new stylesheet loads, remove all old ones
    newLink.onload = () => {
        // Remove all matching old stylesheets
        linkElements.forEach(oldLink => {
            oldLink.remove()
        })
        pendingStylesheetUpdates.delete(filename)
    }

    // Handle loading errors
    newLink.onerror = () => {
        console.error(`Failed to load stylesheet: ${newLink.href}`)
        pendingStylesheetUpdates.delete(filename)
    }

    // Insert the new stylesheet after the first matching one
    if (linkElements.length > 0) {
        const firstLink = linkElements[0]
        firstLink.parentNode?.insertBefore(newLink, firstLink.nextSibling)
    } else {
        // Fallback: append to head if no existing stylesheets found
        document.head.append(newLink)
    }
}

function showExceptionPage(task: string, error: string, details: string, timestamp: string) {
    // Remove existing exception overlay if it exists
    if (exceptionOverlay) {
        exceptionOverlay.remove()
    }

    // Create exception overlay
    exceptionOverlay = document.createElement('div')
    exceptionOverlay.id = 'bunchy-exception-overlay'
    exceptionOverlay.innerHTML = `
        <div class="bunchy-exception-container">
            <div class="bunchy-exception-header">
                <h1>🚨 Build Error</h1>
                <button class="bunchy-exception-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="bunchy-exception-content">
                <div class="bunchy-exception-task">
                    <strong>Task:</strong> ${task}
                </div>
                <div class="bunchy-exception-error">
                    <strong>Error:</strong> ${error}
                </div>
                <div class="bunchy-exception-details">
                    <strong>Details:</strong>
                    <pre>${details}</pre>
                </div>
                <div class="bunchy-exception-timestamp">
                    <strong>Time:</strong> ${new Date(timestamp).toLocaleString()}
                </div>
            </div>
        </div>
    `

    // Add styles
    const styles = document.createElement('style')
    styles.textContent = `
        #bunchy-exception-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', monospace;
        }

        .bunchy-exception-container {
            background: #1a1a1a;
            color: #fff;
            border-radius: 8px;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            border: 2px solid #dc2626;
        }

        .bunchy-exception-header {
            background: #dc2626;
            color: white;
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 6px 6px 0 0;
        }

        .bunchy-exception-header h1 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
        }

        .bunchy-exception-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background-color 0.2s;
        }

        .bunchy-exception-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .bunchy-exception-content {
            padding: 20px;
        }

        .bunchy-exception-task,
        .bunchy-exception-error,
        .bunchy-exception-details,
        .bunchy-exception-timestamp {
            margin-bottom: 16px;
        }

        .bunchy-exception-task strong,
        .bunchy-exception-error strong,
        .bunchy-exception-details strong,
        .bunchy-exception-timestamp strong {
            color: #fbbf24;
            display: block;
            margin-bottom: 4px;
        }

        .bunchy-exception-details pre {
            background: #2d2d2d;
            border: 1px solid #404040;
            border-radius: 4px;
            padding: 12px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 12px;
            line-height: 1.4;
            color: #f87171;
        }

        .bunchy-exception-timestamp {
            font-size: 14px;
            color: #9ca3af;
            border-top: 1px solid #404040;
            padding-top: 12px;
        }
    `

    // Add styles to head if not already present
    if (!document.querySelector('#bunchy-exception-styles')) {
        styles.id = 'bunchy-exception-styles'
        document.head.append(styles)
    }

    // Add overlay to body
    document.body.append(exceptionOverlay)

    // Add escape key handler
    const escapeHandler = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && exceptionOverlay) {
            exceptionOverlay.remove()
            document.removeEventListener('keydown', escapeHandler)
        }
    }
    document.addEventListener('keydown', escapeHandler)
}

function hideExceptionPage() {
    if (exceptionOverlay) {
        exceptionOverlay.remove()
        exceptionOverlay = null
    }
}

// Helper function to initialize Bunchy with configurable log forwarding
function initializeBunchy(options: { logPrefix?: string } = {}) { return new BunchyClient(options) }

function setupLoggerForwarding(client: WebSocketClient, options: { prefix?: string } = {}) {
    const prefix = options.prefix || 'B'
    // Set up log forwarding for the browser logger
    if (typeof (logger as any).setLogForwarder === 'function') {
        // eslint-disable-next-line no-console
        console.log('[Bunchy] Setting up log forwarder with prefix:', prefix)
        let isForwarding = false
        ;(logger as any).setLogForwarder((logLevel: any, msg: string, args: any[]) => {
            // Prevent recursive forwarding caused by logs emitted during forwarding (e.g., ws-client debug)
            if (isForwarding) { return }
            // Only forward if we're connected
            if ((client as any).isConnected && (client as any).isConnected()) {
                const serializedArgs = args.map((arg) => {
                    try {
                        return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    } catch {
                        return '[Circular or unserializable object]'
                    }
                })

                isForwarding = true
                client
                    .post('/logs/forward', {
                        args: serializedArgs,
                        level: logLevel,
                        message: msg,
                        prefix,
                        source: 'client',
                        timestamp: new Date().toISOString(),
                    })
                    .catch((error: any) => {
                        // eslint-disable-next-line no-console
                        console.warn('[Bunchy] Failed to forward log:', error)
                    })
                    .finally(() => {
                        isForwarding = false
                    })
            }
        })
    } else {
        // eslint-disable-next-line no-console
        console.warn('[Bunchy] logger.setLogForwarder is not available')
    }
}

class BunchyClient extends WebSocketClient {
    private logPrefix: string

    constructor(options: { logPrefix?: string } = {}) {
        // Use the full path to prevent WebSocketClient from appending /ws
        // The endpoint should match the path provided in the server configuration
        const url = `ws://${globalThis.location.hostname}:${(globalThis as any).location.port}/bunchy`

        super(url)
        this.logPrefix = options.logPrefix || 'B'

        console.log('[Bunchy] Client initialized with prefix:', this.logPrefix)

        // Set up route handlers BEFORE connecting to avoid race condition
        this.setupRouter()
        // Use generic helper to attach forwarding
        setupLoggerForwarding(this, { prefix: this.logPrefix })

        // Small delay to ensure handlers are fully registered before connecting
        setTimeout(() => {
            this.connect()
        }, 100)
    }

    setupRouter() {
        // Using URL-based routing method for handling bunchy task messages
        this.onRoute('/tasks/code_frontend', () => {
            hideExceptionPage()
            globalThis.location.reload()
        })

        this.onRoute('/tasks/html', () => {
            hideExceptionPage()
            globalThis.location.reload()
        })

        this.onRoute('/tasks/styles/app', (data) => {
            const {filename, publicPath} = data as {filename: string, publicPath: string}
            hideExceptionPage()
            updateStylesheet(filename, publicPath)
        })

        this.onRoute('/tasks/styles/components', (data) => {
            const {filename, publicPath} = data as {filename: string, publicPath: string}
            hideExceptionPage()
            updateStylesheet(filename, publicPath)
        })

        this.onRoute('/tasks/error', (data) => {
            const {task, error, details, timestamp} = data as {task: string, error: string, details: string, timestamp: string}
            showExceptionPage(task, error, details, timestamp)
        })
    }

    // Backwards compatible method (delegates to generic function)
    setupLogForwarding() { setupLoggerForwarding(this, { prefix: this.logPrefix }) }
}

export {initializeBunchy, setupLoggerForwarding, BunchyClient }