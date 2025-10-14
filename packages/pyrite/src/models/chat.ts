import {$s} from '@/app'
import {events, notifier} from '@garage44/common/app'
import {logger} from '@garage44/common/lib/logger'
import {commands} from './sfu/sfu.ts'
import {connection} from './sfu/sfu.ts'

export function _events() {
    // TODO: Implement reactivity for panels.chat collapsed state
    // When chat panel is opened, clear unread count

    events.on('channel', ({action, channelId, channel = null}) => {
        logger.debug('switch chat channel to ', channelId)
        if (action === 'switch') {
            if (!$s.chat.channels[channelId]) {
                $s.chat.channels[channelId] = channel
            }

            selectChannel(channelId)
        }
    })

    events.on('disconnected', () => {
        $s.chat.channels.main.messages = []
        $s.chat.channels.main.unread = 0
    })

    // User left; clean up the channel.
    events.on('user', ({action, user}) => {
        if (action === 'del' && $s.chat.channels[user.id]) {
            // Change the active to-be-deleted channel to main
            if ($s.chat.channel === user.id) {
                selectChannel('main')
            }
            delete $s.chat.channels[user.id]
        }
    })
}

export function closeChannel(channel) {
    selectChannel('main')
    delete $s.chat.channels[channel.id]
}

export function clearChat() {
    logger.debug('clearing chat from remote')
    $s.chat.channels.main.messages = []
}

/**
 * Galene SFU message handler
 * @param {*} sourceId
 * @param {*} destinationId
 * @param {*} nick
 * @param {*} time
 * @param {*} privileged
 * @param {*} history
 * @param {*} kind
 * @param {*} message
 */
export async function onMessage(sourceId, destinationId, nick, time, privileged, history, kind, message) {
    if (!kind) kind = 'default'
    let channelId
    // Incoming message for the main channel
    if (!destinationId) {
        channelId = 'main'
        $s.chat.channels.main.messages.push({kind, message, nick, time})
    }
    // This is a private message
    else if (destinationId && sourceId) {
        channelId = sourceId
        const activeUser = $s.users.find((user) => user.id === sourceId)
        if (activeUser) {
            if (!$s.chat.channels[sourceId]) {
                $s.chat.channels[sourceId] = {
                    id: sourceId,
                    messages: [],
                    name: nick,
                    unread: 0,
                }
            }

            $s.chat.channels[sourceId].messages.push({kind, message, nick, time})
        }
    }

    // Notifies user of a new message when the active channel
    // is not visible, because the chat panel is closed or a different
    // channel is active. Not that the chat history is also replayed through
    // onMessage. This is why no chat channel is selected initially;
    // we don't want to show those messages while entering the group.
    if (
        $s.chat.channels[$s.chat.channel] &&
        ((channelId !== $s.chat.channel) || $s.panels.chat.collapsed)
    ) {
        $s.chat.channels[channelId].unread += 1
    }

}

export const emojiLookup = new Set()

export function selectChannel(channel) {
    if (typeof channel === 'string') {
        channel = $s.chat.channels[channel]
    }
    $s.chat.channel = channel.id
    channel.unread = 0
}

export function sendMessage(message) {
    const isCommand = (message[0] === '/')
    let me = false

    if (isCommand) {
        if (message.length > 1 && message[1] === '/') {
            message = message.slice(1)
            me = false
        } else {
            let cmd, rest
            let space = message.indexOf(' ')
            if (space < 0) {
                cmd = message.slice(1)
                rest = ''
            } else {
                cmd = message.slice(1, space)
                rest = message.slice(space + 1)
            }

            message = ''

            if (cmd === 'me') {
                message = rest
                me = true
            } else {
                let c = commands[cmd]
                if (!c) {
                    notifier.notify({
                        level: 'error',
                        message: `Uknown command /${cmd}, type /help for help`,
                    })
                    return
                }
                if (c.predicate) {
                    const message = c.predicate()
                    if (message) {
                        notifier.notify({level: 'error', message})
                        return
                    }
                }
                try {
                    c.f(cmd, rest)
                } catch (e) {
                    notifier.notify({level: 'error', message: e})
                }
                return
            }
        }
    }

    // Sending to the main channel uses an empty string;
    // a direct message uses the user (connection) id.
    if ($s.chat.channel === 'main') {
        connection.chat(me ? 'me' : '', '', message)
    } else {
        // A direct message is not replayed locally through
        // onChat, so we need to add the message ourselves.
        connection.chat(me ? 'me' : '', $s.chat.channel, message)
        $s.chat.channels[$s.chat.channel].messages.push({
            kind: 'default',
            message,
            nick: $s.user.username,
            time: Date.now(),
        })
    }
}

export function unreadMessages() {
    let unread = 0

    for (const channel of Object.values($s.chat.channels)) {
        unread += channel.unread
    }
    return unread
}
