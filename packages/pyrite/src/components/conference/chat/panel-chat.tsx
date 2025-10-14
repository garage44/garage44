import ChatMessage from './message'
import classnames from 'classnames'
import {useEffect, useRef, useMemo} from 'preact/hooks'
import {Icon} from '@/components/elements'
import Emoji from './emoji'
import {$t} from '@garage44/common/app'
import {$s} from '@/app'
import {selectChannel, closeChannel, sendMessage as sendChatMessage} from '@/models/chat'

export default function PanelChat() {
    const viewRef = useRef<HTMLDivElement>(null)
    const messagesRef = useRef<HTMLDivElement>(null)
    const chatInputRef = useRef<HTMLTextAreaElement>(null)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)

    const channelMessages = useMemo(() => {
        if ($s.chat.channels[$s.chat.channel]) {
            return $s.chat.channels[$s.chat.channel].messages
        }
        return []
    }, [$s.chat.channel, $s.chat.channels])

    const formattedMessage = useMemo(() => {
        return $s.chat.message.trim()
    }, [$s.chat.message])

    const sortedMessages = useMemo(() => {
        if ($s.chat.channels[$s.chat.channel]) {
            const messages = $s.chat.channels[$s.chat.channel].messages
            return [...messages].sort((a, b) => a.time - b.time)
        }
        return []
    }, [$s.chat.channel, $s.chat.channels])

    const addEmoji = (e: MouseEvent, emoji: string) => {
        const message = [...$s.chat.message]
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
        if (e instanceof KeyboardEvent) {
            // ctrl/shift/meta +enter is next line.
            if (!(e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.metaKey)) {
                $s.chat.message += '\r\n'
                return false
            }
        }

        sendChatMessage(formattedMessage)
        $s.chat.message = ''
        $s.chat.emoji.active = false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
        }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            sendMessage(e)
        }
    }

    // Watch channel messages and scroll to bottom
    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight
        }
    }, [channelMessages.length])

    // Setup resize observer and initial scroll
    useEffect(() => {
        if (!viewRef.current || !messagesRef.current) return

        // Keep track of the user-set width of the chat-window, so
        // we can restore it after toggling the chat window.
        resizeObserverRef.current = new ResizeObserver(() => {
            if (viewRef.current) {
                $s.chat.width = parseInt(viewRef.current.style.width.replace('px', ''))
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

    return (
        <div ref={viewRef} class={classnames('c-panel-chat', {[$s.env.layout]: true})}>
            {$s.chat.emoji.active && <Emoji onselect={addEmoji} />}

            <div ref={messagesRef} class="messages scroller">
                {sortedMessages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                ))}
            </div>

            {!$s.chat.emoji.active && (
                <div class="chat-channels">
                    {Object.entries($s.chat.channels).map(([key, channel]) => (
                        <div
                            key={channel.id}
                            class={classnames('chat-channel', {active: channel.id === $s.chat.channel})}
                            onClick={() => selectChannel(channel)}
                        >
                            <div class="channel-name">
                                <Icon class="icon icon-s" icon-props={{unread: channel.unread}} name="chat" />
                            </div>

                            <span>{key === 'main' ? $t('chat.general') : channel.name}</span>
                            {channel.id !== 'main' && (
                                <button
                                    class="btn btn-icon btn-close"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        closeChannel(channel)
                                    }}
                                >
                                    <Icon class="icon icon-xs" name="close" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div class="send">
                <textarea
                    ref={chatInputRef}
                    value={$s.chat.message}
                    onInput={(e) => $s.chat.message = (e.target as HTMLTextAreaElement).value}
                    autofocus={true}
                    placeholder={$t('chat.type_help')}
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
