import classnames from 'classnames'
import {useMemo} from 'preact/hooks'
import {$t} from '@garage44/common/app'
import {getAvatarUrl} from '@garage44/common/lib/avatar'
import {emojiLookup} from '@/models/chat'
import {$s} from '@/app'

const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig

interface MessageBlock {
    type: 'text' | 'emoji' | 'url'
    value: string
}

interface MessageProps {
    message: {
        message: string
        nick?: string
        time: number
        kind: string
        user_id?: string
    }
    channelId?: number
}

export default function Message({ message, channelId }: MessageProps) {
    const messageModel = useMemo(() => {
        let messageData: MessageBlock[] = []
        let textBlock: MessageBlock = { type: 'text', value: '' }

        // Spread takes care of properly separating most special symbols
        // with multiple characters(e.g. emoji characters)
        let _message = [...message.message]
        for (const char of _message) {
            if (emojiLookup.has(char.codePointAt(0)!)) {
                if (textBlock.value.length) {
                    messageData.push(textBlock)
                    textBlock = { type: 'text', value: '' }
                }

                messageData.push({ type: 'emoji', value: char })
            } else {
                textBlock.value = textBlock.value + char
            }
        }
        // Flush blocks.
        if (textBlock.value.length) {
            messageData.push(textBlock)
        }

        for (const [index, block] of messageData.entries()) {
            if (block.type !== 'text') continue
            const nodes = block.value.split(urlRegex).filter((i) => (!['http', 'https'].includes(i)))
            const replaceBlocks: MessageBlock[] = []
            for (const node of nodes) {
                if (node.match(urlRegex)) {
                    replaceBlocks.push({ type: 'url', value: node })
                } else {
                    replaceBlocks.push({ type: 'text', value: node })
                }
            }
            messageData.splice(index, 1, ...replaceBlocks)
        }

        return messageData.flat()
    }, [message.message])

    const formatTime = (ts: number) => {
        const date = new Date(ts)
        return date.toLocaleTimeString()
    }

    // Get avatar from global users or channel members (fallback)
    let avatarUrl: string | null = null
    if (message.user_id) {
        // Try global users first (available across all channels)
        if ($s.chat.users?.[message.user_id]) {
            avatarUrl = getAvatarUrl($s.chat.users[message.user_id].avatar, message.user_id)
        } else if (channelId) {
            // Fallback to channel members for backward compatibility
            const channelKey = channelId.toString()
            const channel = $s.chat.channels[channelKey]
            if (channel?.members?.[message.user_id]) {
                avatarUrl = getAvatarUrl(channel.members[message.user_id].avatar, message.user_id)
            }
        }
    }

    // Get initials for fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div class={classnames('message', { command: !message.nick, [message.kind]: true })}>
            {message.kind === 'me' && (
                <div>
                    <div class="text">
                        {message.nick} {$t(message.message)}...
                    </div>
                    <div class="time">
                        {formatTime(message.time)}
                    </div>
                </div>
            )}

            {message.kind !== 'me' && (
                <>
                    {message.nick && (
                        <header>
                            <div class="author">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={message.nick} class="avatar" />
                                ) : (
                                    <div class="avatar-initials">{getInitials(message.nick)}</div>
                                )}
                                <span class="username">{message.nick}</span>
                            </div>
                            <div class="time">
                                {formatTime(message.time)}
                            </div>
                        </header>
                    )}
                    <section>
                        {messageModel.map((msgModel, index) => (
                            <span key={index}>
                                {msgModel.type === 'text' && <span class="text">{msgModel.value}</span>}
                                {msgModel.type === 'emoji' && <span class="emoji">{msgModel.value}</span>}
                                {msgModel.type === 'url' && (
                                    <a href={msgModel.value} target="_blank" rel="noopener noreferrer" class="url">
                                        {msgModel.value}
                                    </a>
                                )}
                            </span>
                        ))}
                    </section>
                </>
            )}
        </div>
    )
}
