// Copyright (c) 2020 by Juliusz Chroboczek.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import * as _protocol from './protocol.ts'
import _commands from './commands.ts'
import {notifier} from '@garage44/common/app'
import {$s} from '@/app'
import {logger} from '@garage44/common/lib/logger'
import {formatBytes} from '@garage44/common/lib/utils'

export const protocol = _protocol
export const commands = _commands

export let connection
export let file

let localGlnStream
let promiseConnect

export async function addFileMedia(file) {
    logger.info('add file media')
    const {glnStream} = newUpStream(null, {
        direction: 'up',
        mirror: false,
        src: file,
    })
    glnStream.label = 'video'
    $s.upMedia[glnStream.label].push(glnStream.id)
    glnStream.userdata.play = true
    return glnStream
}

export async function addShareMedia() {
    logger.info('add share media')
    let stream = null
    try {
        if (!('getDisplayMedia' in navigator.mediaDevices))
            throw new Error('Your browser does not support screen sharing')
            /** @ts-ignore */
        stream = await navigator.mediaDevices.getDisplayMedia({audio: true, video: true})
    } catch (e) {
        notifier.notify({level: 'error', message: e})
        return
    }

    const {glnStream, streamState} = newUpStream()
    glnStream.label = 'screenshare'
    $s.upMedia[glnStream.label].push(glnStream.id)
    glnStream.stream = stream

    stream.getTracks().forEach(t => {
        if (t.kind === 'audio') {
            streamState.hasAudio = true
        } else if (t.kind === 'video') {
            streamState.hasVideo = true
        }
        glnStream.pc.addTrack(t, stream)
        // Screensharing was stopped; e.g. through browser ui.
        t.onended = () => {
            delUpMedia(glnStream)
        }
    })

    return glnStream
}

export async function addUserMedia() {
    let localStreamId = findUpMedia('camera')
    let oldStream = localStreamId && connection.up[localStreamId]

    if (oldStream) {
        logger.debug(`removing old stream`)
        stopUpMedia(oldStream)
    }

    const {glnStream, streamState} = newUpStream(localStreamId)
    glnStream.label = 'camera'
    glnStream.stream = app.$m.media.localStream
    localGlnStream = glnStream

    $s.upMedia[glnStream.label].push(glnStream.id)

    app.$m.media.localStream.getTracks().forEach(t => {
        if (t.kind === 'audio') {
            streamState.hasAudio = true
            if (!$s.devices.mic.enabled) {
                logger.info('muting local stream')
                t.enabled = false
            }
        } else if (t.kind === 'video') {
            streamState.hasVideo = true
            if ($s.devices.cam.resolution.id === '1080p') {
                t.contentHint = 'detail'
            }
        }
        glnStream.pc.addTrack(t, app.$m.media.localStream)
    })

    return new Promise((resolve) => {
        localGlnStream.onstatus = (status) => {
            if (status === 'connected') {
                resolve()
            }
        }
    })
}

export async function connect(username, password) {
    if (connection && connection.socket) {
        connection.close()
    }
    connection = new protocol.ServerConnection()

    connection.onconnected = () => {
        logger.info('[connected] connected to Galène websocket')
        $s.user.id = connection.id
        const groupName = app.router.currentRoute.value.params.groupId
        connection.join(groupName, username, password)
    }

    connection.onchat = app.$m.chat.onMessage
    connection.onclearchat = app.$m.chat.clearChat
    connection.onclose = onClose
    connection.ondownstream = onDownStream
    connection.onuser = onUser
    connection.onjoined = onJoined
    connection.onusermessage = onUserMessage
    connection.onfiletransfer = onFileTransfer

    let url = `ws${location.protocol === 'https:' ? 's' : ''}://${location.host}/ws`
    logger.info(`connecting websocket ${url}`)

    try {
        await connection.connect(url)
        // Share initial status with other users.
        connection.userAction('setdata', connection.id, $s.user.data)
    } catch (e) {
        notifier.notify({
            level: 'error',
            message: e.message ? e.message : "Couldn't connect to " + url,
        })
    }

    return new Promise((resolve, reject) => {
        promiseConnect = {reject, resolve}
    })

}

export function delLocalMedia() {
    if (app.$m.media.screenStream) {
        logger.info(`disconnect screen share stream`)
        delUpMedia(app.$m.media.screenStream)
    }
    if (!app.$m.media.localStream) return

    logger.info('delete local media share media')
    app.$m.media.removeLocalStream()
}

export function delMedia(id) {
    const delStreamIndex = $s.streams.findIndex(i => i.id === id)
    if (delStreamIndex === -1) return

    const delStream = $s.streams[delStreamIndex]
    logger.info(`[delMedia] remove stream ${delStream.id} from stream state (${delStreamIndex})`)
    $s.streams.splice(delStreamIndex, 1)
}

export function delUpMedia(c) {
    stopUpMedia(c)
    delMedia(c.id)

    c.close()
    delete(connection.up[c.id])
}

export function delUpMediaKind(label) {
    logger.debug(`remove all up media with label: ${label}`)
    for (let id in connection.up) {
        const c = connection.up[id]
        if (label && c.label !== label) {
            continue
        }
        c.close()
        delMedia(id)
        delete(connection.up[id])
        logger.debug(`remove up media stream: ${id}`)
        $s.upMedia[label].splice($s.upMedia[label].indexOf(id), 1)
    }
}

export function disconnect() {
    logger.info(`disconnecting from group ${$s.group.name}`)
    $s.group.connected = false
    $s.streams = []
    // Always reset active channel on disconnect
    $s.chat.channel = ''
    connection.close()
    delLocalMedia()
}

function fileTransferEvent(state, data) {
    let f = this
    switch (state) {
    case 'inviting':
        break
    case 'connecting':
        break
    case 'connected':
        if (f.up) {
            Object.assign(f.notifier, {
                buttons: [{
                    action: () => f.cancel(),
                    icon: 'Close',
                    text: 'Abort',
                }],
                message: app.$t('user.action.share_file.sending', {file: f.name}),
                progress: {
                    boundaries: ['0', formatBytes(f.size)],
                    percentage: Math.ceil((f.datalen / f.size) * 100),
                },

            })
        }
        else {
            Object.assign(f.notifier, {
                buttons: [{
                    action: () => f.cancel(),
                    icon: 'Close',
                    text: 'Abort',
                }],
                message: app.$t('user.action.share_file.receiving', {file: f.name}),
                progress: {
                    boundaries: ['0', formatBytes(f.size)],
                    percentage: Math.ceil((f.datalen / f.size) * 100),
                },
            })
        }
        break
    case 'done':
        if (!f.up) {
            let url = URL.createObjectURL(data)
            let a = document.createElement('a')
            a.href = url
            a.textContent = f.name
            a.download = f.name
            a.type = f.mimetype
            a.click()
            URL.revokeObjectURL(url)
            Object.assign(f.notifier, {
                buttons: [],
                message: app.$t('user.action.share_file.transfer_complete', {
                    file: f.name,
                    size: formatBytes(f.size),
                }),
                progress: null,
            })
        } else {
            Object.assign(f.notifier, {
                buttons: [],
                message: app.$t('user.action.share_file.transfer_complete', {
                    file: f.name,
                    size: formatBytes(f.size),
                }),
                progress: null,
            })
        }
        notifier.setTimeout(f.notifier)
        break
    case 'cancelled':
        Object.assign(f.notifier, {
            buttons: [],
            level: 'warning',
            message: app.$t('user.action.share_file.transfer_cancelled', {file: f.name}),
            progress: null,
        })
        notifier.setTimeout(f.notifier)
        break
    case 'closed':
        break
    default:
        Object.assign(f.notifier, {
            buttons: [],
            level: 'error',
            message: app.$t('error', {error: state}),
            progress: null,
        })
        notifier.setTimeout(f.notifier)
        f.cancel(`unexpected state "${state}" (this shouldn't happen)`)
        break
    }
}

function findUpMedia(label) {
    for (let id in connection.up) {
        if (connection.up[id].label === label)
            return id
    }
    return null
}

function getMaxVideoThroughput() {
    switch ($s.media.upstream.id) {
    case 'lowest':
        return 150000
    case 'low':
        return 300000
    case 'normal':
        return 700000
    case 'unlimited':
        return null
    default:
        return 700000
    }
}

function mapRequest(what) {
    switch (what) {
    case '':
        return {}
    case 'audio':
        return {'': ['audio']}
    case 'screenshare-low':
        return {'': ['audio'], screenshare: ['audio','video-low']}
    case 'screenshare':
        return {'': ['audio'], screenshare: ['audio','video']}
    case 'everything-low':
        return {'': ['audio','video-low']}
    case 'everything':
        return {'': ['audio','video']}
    default:
        throw new Error(`Unknown value ${what} in request`)
    }
}

export function muteMicrophone(muted) {
    $s.devices.mic.enabled = !muted
    logger.debug(`microphone enabled: ${$s.devices.mic.enabled}`)
    for (let id in connection.up) {
        const glnStream = connection.up[id]
        if (glnStream.label === 'camera') {
            glnStream.stream.getTracks().forEach(t => {
                if (t.kind === 'audio') {
                    t.enabled = !muted
                }
            })
        }
    }
}

function newUpStream(_id, state) {
    const glnStream = connection.newUpStream(_id)

    let streamState = {
        aspectRatio: 4 / 3,
        direction: 'up',
        enlarged: false,
        hasAudio: false,
        hasVideo: false,
        id: glnStream.id,
        mirror: true,
        playing: false,
        settings: {audio: {}, video: {}},
        username: $s.user.username,
        volume: {
            locked: false,
            value: 100,
        },
    }

    // Override properties; e.g. disable mirror for file streams.
    if (state) {
        Object.assign(streamState, state)
    }

    glnStream.onerror = (e) => {
        notifier.notify({level: 'error', message: e})
        delUpMedia(glnStream)
    }
    glnStream.onabort = () => {
        delUpMedia(glnStream)
    }
    glnStream.onnegotiationcompleted = () => {
        const maxThroughput = getMaxVideoThroughput()
        setMaxVideoThroughput(glnStream, maxThroughput)
        $s.streams.push(streamState)
    }

    return {glnStream, streamState}
}

function onClose(code, reason) {
    logger.debug('connection closed')
    app.emit('disconnected')
    $s.group.connected = false

    delUpMediaKind(null)

    if (code != 1000) {
        notifier.notify({level: 'error', message: `Socket close ${code}: ${reason}`})
    }

    app.router.push({name: 'conference-groups'}, {params: {groupId: $s.group.name}})
}

function onDownStream(c) {
    logger.debug(`[onDownStream] ${c.id}`)
    c.onclose = (replace) => {
        if (!replace) {
            logger.debug(`[onclose] downstream ${c.id}`)
            delMedia(c.id)
        }
    }

    c.onerror = () => {
        const message = `[onerror] downstream ${c.id}`
        logger.error(message)
        notifier.notify({level: 'error', message})
    }

    // When other-end Firefox replaces a stream (e.g. toggles webcam),
    // the onDownStream method is called twice.
    if (!$s.streams.find((s) => s.id === c.id)) {
        $s.streams.push({
            aspectRatio: 4 / 3,
            direction: 'down',
            enlarged: false,
            hasAudio: false,
            hasVideo: false,
            id: c.id,
            mirror: true,
            playing: false,
            settings: {audio: {}, video: {}},
            username: c.username,
            volume: {
                locked: false,
                value: 100,
            },
        })
    }
}

async function onFileTransfer(f) {
    f.onevent = fileTransferEvent
    if (f.up) {
        f.notifier = notifier.notify({
            buttons: [{
                action: () => f.cancel(),
                icon: 'Close',
                text: 'Abort',
            }],
            level: 'info',
            message: app.$t('user.action.share_file.share_confirm', {
                file: f.name,
                size: formatBytes(f.size),
                username: f.username,
            }),
        }, 0)
    } else {
        f.notifier = notifier.notify({
            buttons: [{
                action: () => f.cancel(),
                icon: 'Close',
                text: 'Ignore',
            }, {
                action: () => f.receive(),
                icon: 'Save',
                text: 'Save file',
            }],
            level: 'info',
            message: app.$t('user.action.share_file.share_accept', {
                file: f.name,
                size: formatBytes(f.size),
                username: f.username,
            }),
        }, 0)
    }
}

async function onJoined(kind, group, permissions, status, data, message) {
    logger.debug(`[onJoined] ${kind}/${group}: ${message}`)
    let currentGroup = app.$m.group.currentGroup()
    let _permissions = {}
    switch (kind) {
    case 'fail':
        promiseConnect.reject(message)
        promiseConnect = null

        // Closing the connection will trigger a 'leave' message,
        // which handles the accompanying UI flow.
        connection.close()
        return
    case 'leave':
        disconnect()
        return
    case 'join':
        for (const permission of permissions) {
            _permissions[permission] = true
        }
        $s.permissions = _permissions
        promiseConnect.resolve(message)
        promiseConnect = null
        break
    case 'change':

        for (const permission of permissions) {
            _permissions[permission] = true
        }
        $s.permissions = _permissions

        if (status && status.locked) {
            currentGroup.locked = true
            // A custom message is sent along:
            let personal = null
            if (status.locked !== true) personal = {group, message:status.locked}
            notifier.message('lock', {group}, personal)
        } else if (currentGroup.locked) {
            currentGroup.locked = false
            notifier.message('unlock', {group})
        }

        logger.debug(`permissions: ${JSON.stringify(permissions)}`)
        if (kind === 'change')
            return
        break
    default:
        notifier.notify({level: 'error', message: 'Unknown join message'})
        connection.close()
        return
    }

    logger.debug(`request Galène media types: ${$s.media.accept.id}`)
    connection.request(mapRequest($s.media.accept.id))

    if ($s.permissions.present && !findUpMedia('camera')) {
        await app.$m.media.getUserMedia($s.devices)
    }
}

function onUser(id, kind) {
    let user = {...connection.users[id], id}
    let _permissions = {}
    if (user.permissions) {
        for (const permission of user.permissions) {
            _permissions[permission] = true
        }
    } else {
        user.permissions = {}
    }

    user.permissions = _permissions

    logger.debug(`[onUser] ${kind}/${id}/${user.username}`)

    if (kind ==='add') {
        // There might be a user with name 'RECORDING' that is an ordinary user;
        // only trigger the recording flag when it is a system user.
        if (user.username === 'RECORDING' && user.permissions.system) {
            $s.group.recording = user.id
            notifier.message('record', {dir: 'target', group: $s.group.name})
        }

        if (id === $s.user.id) {
            // Restore user data back from state and notify others about it.
            user.data = $s.user.data
            connection.userAction('setdata', connection.id, $s.user.data)
        }

        $s.users.push(user)
        app.emit('user', {action: 'add', user})
    } else if (kind === 'change') {
        if (id === $s.user.id) {
            const $user = $s.users.find((i) => i.id === user.id)
            // Shutdown the local stream when the Present permission is taken away.
            if ($user.permissions.present && !user.permissions.present) {
                delUpMedia(localGlnStream)
                $s.devices.cam.enabled = false
                $s.devices.mic.enabled = false

                notifier.message('unpresent', {group: $s.group.name})
            } else if (!$user.permissions.present && user.permissions.present) {
                notifier.message('present')
            } else if ($user.permissions.op && !user.permissions.op) {
                notifier.message('unop')
            } else if (!$user.permissions.op && user.permissions.op) {
                notifier.message('op')
            }

            $s.user.data = {...$s.user.data, ...user.data}
            app.store.save()
        }

        $s.users.splice($s.users.findIndex((i) => i.id === user.id), 1, user)
    } else if (kind === 'delete') {
        if (user.id === $s.group.recording) {
            $s.group.recording = false
            notifier.message('unrecord', {dir: 'target', group: $s.group.name})
        }

        $s.users.splice($s.users.findIndex((u) => u.id === id), 1)
        app.emit('user', {action: 'del', user})
    }
}

function onUserMessage(id, dest, username, time, privileged, kind, message) {
    let source = username
    if (!source) {
        if (id) source = 'Anonymous'
        else source = 'System Message'
    }

    // Handle incoming notifications here...
    notifier.onUserMessage({id, kind, message, privileged, source})
    // Remote actions are only allowed for operators.
    if (!privileged) return

    switch (kind) {
    // Handle related actions here...
    case 'mute':
        muteMicrophone(true)
        break
    case 'clearchat':
        app.$m.chat.clearChat()
        break
    }
}

export function removeTrack(glnStream, kind) {
    const tracks = glnStream.stream.getTracks()
    tracks.forEach(track => {
        if (track.kind === kind) {
            logger.debug(`stopping track ${track.id}`)
            track.stop()

            const streamState = $s.streams.find((s) => s.id === glnStream.id)
            streamState.hasVideo = false
        }
    })
}

async function setMaxVideoThroughput(c, bps) {
    const unlimitedRate = 1000000000

    let senders = c.pc.getSenders()
    for (let i = 0; i < senders.length; i++) {
        let s = senders[i]
        if (!s.track || s.track.kind !== 'video')
            continue
        let p = s.getParameters()
        if (!p.encodings) p.encodings = [{}]
        p.encodings.forEach(e => {
            if (!e.rid || e.rid === 'h') e.maxBitrate = bps || unlimitedRate

        })
        logger.debug(`set video throughput at max ${bps} bps`)

        await s.setParameters(p)
    }
}

function stopUpMedia(c) {
    logger.debug(`stopping up-stream ${c.id}`)
    c.stream.getTracks().forEach(t => t.stop())

    $s.upMedia[c.label].splice($s.upMedia[c.label].findIndex(i => i.id === c.id), 1)
    $s.streams.splice($s.streams.findIndex(i => i.id === c.id), 1)
}
