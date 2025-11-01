import {$s} from '@/app'
import {logger, notifier, $t} from '@garage44/common/app'
import * as sfu from './sfu/sfu.ts'

export let localStream
export let screenStream

export async function getUserMedia(presence) {
    $s.mediaReady = false
    // Cleanup the old networked stream first:
    if (localStream) {
        if ($s.group.connected) {
            sfu.delUpMediaKind('camera')
        } else {
            sfu.delLocalMedia()
        }
    }

    let selectedAudioDevice = false
    let selectedVideoDevice = false

    if ($s.devices.mic.selected.id !== null) {
        selectedAudioDevice = {deviceId: $s.devices.mic.selected.id}
    }

    if ($s.devices.cam.selected.id !== null) {
        selectedVideoDevice = {deviceId: $s.devices.cam.selected.id}
    }

    if (presence) {
        if (!presence.cam.enabled) selectedVideoDevice = false
        if (!presence.mic.enabled) selectedAudioDevice = false
        // A local stream cannot be initialized with neither audio and video; return early.
        if (!presence.cam.enabled && !presence.mic.enabled) {
            $s.mediaReady = true
            return
        }
    }

    // Verify whether the local mediastream is using the proper device setup.
    logger.debug(`using cam ${$s.devices.cam.selected.name}`)
    logger.debug(`using mic ${$s.devices.mic.selected.name}`)

    if (selectedVideoDevice) {
        if ($s.devices.cam.resolution.id === '720p') {
            logger.debug(`using 720p resolution`)
            selectedVideoDevice.width = {ideal: 1280, min: 640}
            selectedVideoDevice.height = {ideal: 720, min: 400}
        } else if ($s.devices.cam.resolution.id === '1080p') {
            logger.debug(`using 1080p resolution`)
            selectedVideoDevice.width = {ideal: 1920, min: 640}
            selectedVideoDevice.height = {ideal: 1080, min: 400}
        }
    }

    const constraints = {
        audio: selectedAudioDevice,
        video: selectedVideoDevice,
    }

    try {
        localStream = await navigator.mediaDevices.getUserMedia(constraints)
    } catch (message) {
        notifier.notify({level: 'error', message})
        $s.mediaReady = true
        return
    }

    // Add local stream to Galène; handle peer connection logic.
    if ($s.group.connected) {
        await sfu.addUserMedia()
    }

    $s.mediaReady = true
    return localStream
}

export async function queryDevices() {
    logger.info('querying for devices')
    // The device labels stay empty when there is no media permission.
    let devices
    if ($s.env.isFirefox) {
        // The device labels are only available in Firefox while a stream is active.
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
        devices = await navigator.mediaDevices.enumerateDevices()
        for (const track of stream.getTracks()) {
            track.stop()
        }
    } else {
        devices = await navigator.mediaDevices.enumerateDevices()
    }

    const labelnr = {audio: 1, cam: 1, mic: 1}
    const added = []

    $s.devices.mic.options = []
    $s.devices.cam.options = []
    $s.devices.audio.options = []

    for (const device of devices) {
        // The same device may end up in the queryList multiple times;
        // Don't add it twice to the options list.
        if (added.includes(device.deviceId)) {
            continue
        }
        let name = device.label

        if (device.kind === 'videoinput') {
            if (!name) name = `Camera ${labelnr.cam}`
            $s.devices.cam.options.push({id: device.deviceId ? device.deviceId : name, name})
            labelnr.cam++
        } else if (device.kind === 'audioinput') {
            if (!name) name = `Microphone ${labelnr.mic}`
            $s.devices.mic.options.push({id: device.deviceId ? device.deviceId : name, name})
            labelnr.mic++
        } else if (device.kind === 'audiooutput') {
            // Firefox doesn't support audio output enumeration and setSinkid
            if (!name) name = `Output ${labelnr.audio}`
            $s.devices.audio.options.push({id: device.deviceId ? device.deviceId : name, name})
            labelnr.audio++
        }

        added.push(device.deviceId)
    }

    logger.debug(`device list updated`)
}

export function removeLocalStream() {
    localStream.getTracks().forEach(track => {
        logger.debug(`stopping track ${track.id}`)
        track.stop()
    })

    localStream = null
}

export function setDefaultDevice(useFirstAvailable = true) {
    const invalidDevices = validateDevices()
    const emptyOption = {id: null, name: ''}
    for (const key of Object.keys($s.devices)) {
        if (key === 'audio' && $s.env.isFirefox) continue

        if (invalidDevices[key] || $s.devices[key].selected.id === null) {
            if (useFirstAvailable && $s.devices[key].options.length) {
                $s.devices[key].selected = $s.devices[key].options[0]
            } else {
                $s.devices[key].selected = emptyOption
            }
        }
    }
}

export function setScreenStream(stream) {
    screenStream = stream
}

export function validateDevices() {
    const devices = $s.devices
    return {
        audio: !$s.env.isFirefox && (!devices.audio.options.length || !devices.audio.options.find((i) => i.id === devices.audio.selected.id)),
        cam: !devices.cam.options.length || !devices.cam.options.find((i) => i.id === devices.cam.selected.id),
        mic: !devices.mic.options.length || !devices.mic.options.find((i) => i.id === devices.mic.selected.id),
    }
}

navigator.mediaDevices.ondevicechange = async() => {
    const oldDevices = JSON.parse(JSON.stringify($s.devices))
    await queryDevices()
    let added = [], removed = []
    for (const deviceType of Object.keys($s.devices)) {
        const _added = $s.devices[deviceType].options.filter((i) => !oldDevices[deviceType].options.find((j) => i.id === j.id))
        const _removed = oldDevices[deviceType].options.filter((i) => !$s.devices[deviceType].options.find((j) => i.id === j.id))
        if (_added.length) added = added.concat(_added)
        if (_removed.length) removed = removed.concat(_removed)
    }

    if (added.length) {
        notifier.notify({
            icon: 'Headset',
            level: 'info',
            list: added.map((i) => i.name),
            message: $t('device.added', {count: added.length}),
        })
    }
    if (removed.length) {
        notifier.notify({
            icon: 'Headset',
            level: 'warning',
            list: removed.map((i) => i.name),
            message: $t('device.removed', {count: removed.length}),
        })
    }
    const invalidDevices = validateDevices()

    if ($s.group.connected && Object.values(invalidDevices).some((i) => i)) {
        // Note: Routing should be handled by the component, not here
        notifier.notify({
            icon: 'Headset',
            level: 'warning',
            list: Object.entries(invalidDevices)
                .filter(([_, value]) => value)
                .map(([key]) => $t(`device.select_${key}_label`)),
            message: $t('device.action_required', {count: removed.length}),
        })
        // Don't set a default option; it must be clear that an
        // invalid device option is set while being connected.
        setDefaultDevice(false)
    } else {
        setDefaultDevice(true)
    }

}
