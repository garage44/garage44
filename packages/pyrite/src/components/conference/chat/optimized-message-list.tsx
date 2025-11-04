/**
 * Optimized Message List Component
 * Uses virtual scrolling for large message lists
 * Memoizes message rendering to prevent unnecessary re-renders
 */

import {h} from 'preact'
import {memo} from 'preact/compat'
import {useEffect, useMemo, useRef, useState} from 'preact/hooks'
import ChatMessage from './message'

interface OptimizedMessageListProps {
    messages: any[]
    channelSlug: string
    typing: Record<string, {userId: string; username: string; timestamp: number}>
}

// Message height estimation for virtual scrolling
const MESSAGE_HEIGHT_ESTIMATE = 80 // Average message height in pixels
const BUFFER_SIZE = 5 // Number of messages to render above/below viewport

/**
 * Memoized message renderer - only re-renders when message changes
 */
const MemoizedMessage = memo(ChatMessage, (prevProps, nextProps) => {
    // Only re-render if message content changed
    return prevProps.message === nextProps.message
})

/**
 * Optimized Message List with Virtual Scrolling
 * Only renders messages visible in viewport + buffer
 */
export const OptimizedMessageList = memo(({messages, channelSlug, typing}: OptimizedMessageListProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scrollTop, setScrollTop] = useState(0)
    const [containerHeight, setContainerHeight] = useState(0)

    // Memoize sorted messages - only recompute when messages array changes
    const sortedMessages = useMemo(() => {
        if (messages.length === 0) return []
        // Sort once and cache result
        return [...messages].sort((a, b) => a.time - b.time)
    }, [messages.length]) // Only re-sort when length changes (new messages added)

    // Calculate which messages are visible
    const {visibleMessages, startIndex, endIndex} = useMemo(() => {
        if (sortedMessages.length === 0) {
            return {endIndex: 0, startIndex: 0, visibleMessages: []}
        }

        // Calculate viewport bounds
        const start = Math.max(0, Math.floor(scrollTop / MESSAGE_HEIGHT_ESTIMATE) - BUFFER_SIZE)
        const end = Math.min(
            sortedMessages.length,
            Math.ceil((scrollTop + containerHeight) / MESSAGE_HEIGHT_ESTIMATE) + BUFFER_SIZE
        )

        return {
            endIndex: end,
            startIndex: start,
            visibleMessages: sortedMessages.slice(start, end),
        }
    }, [sortedMessages, scrollTop, containerHeight])

    // Memoize typing users - only recompute when typing object changes
    const typingUsers = useMemo(() => {
        if (!typing) return []
        
        const now = Date.now()
        return Object.values(typing).filter((t) => {
            const isStale = now - t.timestamp > 5000
            // Note: We filter current user in the component that uses this
            return !isStale
        })
    }, [typing])

    // Handle scroll events (throttled)
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let rafId: number | null = null
        
        const handleScroll = () => {
            if (rafId) return // Throttle using requestAnimationFrame
            
            rafId = requestAnimationFrame(() => {
                setScrollTop(container.scrollTop)
                rafId = null
            })
        }

        container.addEventListener('scroll', handleScroll, {passive: true})
        return () => {
            container.removeEventListener('scroll', handleScroll)
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [])

    // Measure container height
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerHeight(entry.contentRect.height)
            }
        })

        observer.observe(container)
        return () => observer.disconnect()
    }, [])

    // Total height for virtual scrolling
    const totalHeight = sortedMessages.length * MESSAGE_HEIGHT_ESTIMATE
    const offsetY = startIndex * MESSAGE_HEIGHT_ESTIMATE

    return (
        <div ref={containerRef} class="messages scroller" style={{position: 'relative'}}>
            {/* Spacer for virtual scrolling */}
            <div style={{height: `${totalHeight}px`, position: 'relative'}}>
                <div style={{transform: `translateY(${offsetY}px)`}}>
                    {visibleMessages.map((message, index) => (
                        <MemoizedMessage
                            key={startIndex + index}
                            message={message}
                            channelSlug={channelSlug}
                        />
                    ))}
                    
                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                        <div class="typing-indicator">
                            {typingUsers.length === 1 ? (
                                <span class="typing-text">
                                    <strong>{typingUsers[0].username}</strong> is typing...
                                </span>
                            ) : (
                                <span class="typing-text">
                                    {typingUsers.length} people are typing...
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}, (prevProps, nextProps) => {
    // Only re-render if messages or typing changed
    return (
        prevProps.messages === nextProps.messages &&
        prevProps.typing === nextProps.typing
    )
})
