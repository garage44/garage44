import {useEffect, useState} from 'preact/hooks'
import {WebSocketEvents} from '@garage44/common/lib/ws-client'
import {events} from '@garage44/common/app'
import {ws} from '../app'

/**
 * NOTE: Currently not used anywhere, but could be useful in the future.
 * @param topic
 * @param handler
 * @returns
 */
export function useWebSocketSubscription(topic: string, handler: (data: unknown) => void) {
    // Track connection status
    const [isConnected, setIsConnected] = useState(ws.isConnected())

    useEffect(() => {
        // Handle connection status changes
        const handleConnected = () => setIsConnected(true)
        const handleDisconnected = () => setIsConnected(false)

        events.on(WebSocketEvents.CONNECTED, handleConnected)
        events.on(WebSocketEvents.DISCONNECTED, handleDisconnected)

        return () => {
            events.off(WebSocketEvents.CONNECTED, handleConnected)
            events.off(WebSocketEvents.DISCONNECTED, handleDisconnected)
        }
    }, [])

    useEffect(() => {
        // Register this subscription for recovery
        ws.addSubscription(topic)

        // Subscribe to the topic
        ws.send(JSON.stringify({
            data: {},
            url: `/subscribe/${topic}`,
        }))

        // Set up event listener
        const eventUrl = `/events/${topic}`
        const handleMessage = (event) => {
            const message = JSON.parse(event.data)
            if (message.url === eventUrl) {
                handler(message.data)
            }
        }

        ws.addEventListener('message', handleMessage)

        // Clean up
        return () => {
            ws.removeEventListener('message', handleMessage)
            ws.removeSubscription(topic)
        }
    }, [topic, handler])

    // Return connection status for components that need it
    return isConnected
}
