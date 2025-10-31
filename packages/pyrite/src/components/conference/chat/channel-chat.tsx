import ChatMessage from './message'
import classnames from 'classnames'
import {useEffect, useRef, useMemo} from 'preact/hooks'
import {Icon} from '@garage44/common/components'
import Emoji from './emoji'
import {logger} from '@garage44/common/app'
import {$s} from '@/app'
import {sendMessage as sendChatMessage} from '@/models/chat'

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault()
    }
}

interface ChannelChatProps {
    channelId: number
}

export default function ChannelChat({channelId}: ChannelChatProps) {
    const viewRef = useRef<HTMLDivElement>(null)
    const messagesRef = useRef<HTMLDivElement>(null)
    const chatInputRef = useRef<HTMLTextAreaElement>(null)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)

    // Get current channel from state - access directly for DeepSignal reactivity
    // Access $s.channels in render so Preact tracks it reactively
    const currentChannel = $s.channels.find((c) => c.id === channelId)

    // Only log when channel is found to avoid spam
    useEffect(() => {
        if (currentChannel) {
            logger.debug(`[ChannelChat] Looking for channel ${channelId}, found:`, currentChannel)
        }
    }, [currentChannel, channelId])

    // Get channel key - needed for accessing messages
    const channelKey = channelId.toString()

    // Access messages directly from DeepSignal - this is reactive
    // Accessing $s.chat.channels[channelKey] in render makes it reactive
    const channelData = $s.chat.channels[channelKey]
    const messages = channelData?.messages || []

    const formattedMessage = useMemo(() => {
        const trimmed = $s.chat.message.trim()
        logger.debug('[ChannelChat] Message state:', $s.chat.message, 'Trimmed:', trimmed)
        return trimmed
    }, [$s.chat.message])

    const addEmoji = (e: MouseEvent, emoji: string) => {
        const message = $s.chat.message.split('')
        const caretPosition = chatInputRef.current?.selectionStart || 0
        if (caretPosition >= 0) {
            message.splice(caretPosition, 0, emoji)
        }
        $s.chat.message = message.join('')

        if (!(e as any).ctrlKey) {
            $s.chat.emoji.active = false
        }
    }

    const sendMessage = async (e: KeyboardEvent | MouseEvent) => {
        if (e instanceof KeyboardEvent && !(e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.metaKey)) {
            // ctrl/shift/meta +enter is next line.
            $s.chat.message += '\r\n'
            return false
        }

        // Don't send empty messages
        if (!formattedMessage) {
            logger.debug('[ChannelChat] Attempted to send empty message')
            return
        }

        logger.debug('[ChannelChat] Sending message:', formattedMessage)

        // Set the active channel before sending
        $s.chat.activeChannelId = channelId
        sendChatMessage(formattedMessage)
        $s.chat.message = ''
        $s.chat.emoji.active = false
    }

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            sendMessage(e)
        }
    }

    // Watch channel messages and scroll to bottom when messages change
    // Access messages.length here to make this reactive to DeepSignal changes
    const messageCount = messages.length
    useEffect(() => {
        if (messagesRef.current && messageCount > 0) {
            // Small delay to ensure DOM has updated
            setTimeout(() => {
                if (messagesRef.current) {
                    messagesRef.current.scrollTop = messagesRef.current.scrollHeight
                }
            }, 0)
        }
    }, [messageCount])

    // Setup resize observer and initial scroll
    useEffect(() => {
        if (!viewRef.current || !messagesRef.current) return

        resizeObserverRef.current = new ResizeObserver(() => {
            if (viewRef.current) {
                $s.chat.width = parseInt(viewRef.current.style.width.replace('px', ''), 10)
            }
        })

        resizeObserverRef.current.observe(viewRef.current)
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect()
            }
        }
    }, [])

    // Set active channel when component mounts
    useEffect(() => {
        $s.chat.activeChannelId = channelId
        // Pre-create channel entry if it doesn't exist for immediate UI feedback
        const channelKey = channelId.toString()
        if (!$s.chat.channels[channelKey]) {
            $s.chat.channels[channelKey] = {
                id: channelKey,
                messages: [],
                unread: 0,
            }
        }
    }, [channelId])

    if (!currentChannel) {
        return (
            <div class="c-channel-chat">
                <div class="channel-not-found">
                    <Icon class="icon icon-l" name="error" />
                    <h2>Channel not found</h2>
                    <p>The channel you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
                </div>
            </div>
        )
    }

    return (
        <div ref={viewRef} class={classnames('c-channel-chat', {[$s.env.layout]: true})}>
            {/* Channel Header */}
            <div class="channel-header">
                <Icon className="icon icon-s" name="chat" />
                <h1>{currentChannel.name}</h1>
                {currentChannel.description && (
                    <p class="channel-description">{currentChannel.description}</p>
                )}
            </div>

            {/* Emoji Picker */}
            {$s.chat.emoji.active && <Emoji onselect={addEmoji} />}

            {/* Messages */}
            <div ref={messagesRef} class="messages scroller">
                {(() => {
                    // Access messages directly in render for DeepSignal reactivity
                    const channelData = $s.chat.channels[channelKey]
                    const msgs = channelData?.messages || []
                    const sorted = msgs.length > 0 ? [...msgs].sort((a, b) => a.time - b.time) : []

                    if (sorted.length === 0) {
                        return (
                            <div class="no-messages">
                                <Icon class="icon icon-l" name="chat" />
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        )
                    }

                    return sorted.map((message, index) => (
                        <ChatMessage key={index} message={message} />
                    ))
                })()}
            </div>

            {/* Message Input */}
            <div class="send">
                <textarea
                    ref={chatInputRef}
                    value={$s.chat.message}
                    onInput={(e) => $s.chat.message = (e.target as HTMLTextAreaElement).value}
                    autofocus={true}
                    placeholder={`Message #${currentChannel.name}`}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                />
                <button
                    class="btn btn-menu"
                    disabled={formattedMessage === ''}
                    onClick={sendMessage}
                >
                    <Icon class="icon icon-s" name="send" />
                </button>
            </div>

            {/* Chat Actions */}
            <div class="chat-actions">
                <button
                    class={classnames('btn btn-menu', {
                        active: $s.chat.emoji.active,
                    })}
                    onClick={() => $s.chat.emoji.active = !$s.chat.emoji.active}
                >
                    😼
                </button>
            </div>
        </div>
    )
}
