import {WebSocketClient} from '@garage44/common/lib/ws-client'

// Keep track of which stylesheets are currently being updated
const pendingStylesheetUpdates = new Set<string>()

function updateStylesheet(filename: string, publicPath: string) {
    // Skip if this stylesheet is already being updated
    if (pendingStylesheetUpdates.has(filename)) {
        return
    }

    // Mark this stylesheet as being updated
    pendingStylesheetUpdates.add(filename)

    // Get all stylesheet links
    const allLinks = Array.from(document.querySelectorAll(`link[rel=stylesheet]`))
        .map(link => link as HTMLLinkElement)

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
    newLink.href = `/public/${filename}?${new Date().getTime()}`

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
        document.head.appendChild(newLink)
    }
}

export class BunchyClient extends WebSocketClient {

        constructor() {
        // Use the full path to prevent WebSocketClient from appending /ws
        // The endpoint should match the path provided in the server configuration
        const url = `ws://${window.location.hostname}:3030/bunchy`

        super(url)

        // Set up route handlers BEFORE connecting to avoid race condition
        this.setupRouter()

        // Small delay to ensure handlers are fully registered before connecting
        setTimeout(() => {
            this.connect()
        }, 100)
    }

        setupRouter() {
        // Using URL-based routing method for handling bunchy task messages
        this.onRoute('/tasks/code_frontend', () => {
            window.location.reload()
        })

        this.onRoute('/tasks/html', () => {
            window.location.reload()
        })

        this.onRoute('/tasks/styles/app', (data) => {
            const {filename, publicPath} = data as {filename: string, publicPath: string}
            updateStylesheet(filename, publicPath)
        })

        this.onRoute('/tasks/styles/components', (data) => {
            const {filename, publicPath} = data as {filename: string, publicPath: string}
            updateStylesheet(filename, publicPath)
        })
    }
}
