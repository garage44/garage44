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

    // Get all matching stylesheet links
    const linkElements = Array.from(document.querySelectorAll(`link[rel=stylesheet]`))
        .map(link => link as HTMLLinkElement)
        .filter(link => link.href.includes(filename))

    if (linkElements.length === 0) {
        pendingStylesheetUpdates.delete(filename)
        return
    }

    // Create only ONE new stylesheet link for all matches
    const newLink = document.createElement('link')
    newLink.rel = 'stylesheet'
    newLink.href = `/${publicPath}/${filename}?${new Date().getTime()}`

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
        // Using console.error is necessary for debugging stylesheet loading issues
        // eslint-disable-next-line no-console
        console.error(`Failed to load stylesheet: ${newLink.href}`)
        pendingStylesheetUpdates.delete(filename)
    }

    // Insert the new stylesheet after the first matching one
    if (linkElements.length > 0) {
        const firstLink = linkElements[0]
        firstLink.parentNode?.insertBefore(newLink, firstLink.nextSibling)
    }
}

export class BunchyClient extends WebSocketClient {

    constructor() {
        // Use the full path to prevent WebSocketClient from appending /ws
        // The endpoint should match the path provided in the server configuration
        const url = `ws://${window.location.hostname}:3030/bunchy`

        super(url)
        this.setupRouter()
        this.connect()
    }

    setupRouter() {
        // Using HTTP-style method calls instead of simple event listeners
        this.on('/tasks/code_backend', () => {
            window.location.reload()
        })

        this.on('/tasks/code_frontend', () => {
            window.location.reload()
        })

        this.on('/tasks/html', () => {
            window.location.reload()
        })

        this.on('/tasks/styles/app', ({filename, publicPath}) => {
            updateStylesheet(filename, publicPath)
        })

        this.on('/tasks/styles/components', ({filename, publicPath}) => {
            updateStylesheet(filename, publicPath)
        })
    }
}
