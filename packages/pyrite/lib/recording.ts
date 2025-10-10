import {config} from './config.ts'
import {logger} from '../service.ts'
import fs from 'fs-extra'
import {globby} from 'globby'
import path from 'node:path'

export async function loadRecordings(groupId) {
    logger.debug(`load recordings from group: ${groupId}`)
    const recordingsPath = path.join(config.sfu.path, 'recordings')
    const files = await globby(path.join(recordingsPath, groupId, '*.webm'))
    const fileStats = await Promise.all(files.map((i) => fs.stat(i, 'utf8')))
    const fileNames = files.map((i) => {
        return i.replace(path.join(recordingsPath, groupId), '').replace('.webm', '').replace('/', '')
    })

    const filesData = []
    for (const [index, filename] of fileNames.entries()) {
        const data = {
            atime: fileStats[index].atime,
            extension: 'webm',
            filename,
            size: fileStats[index].size,
        }
        filesData.push(data)
    }

    return filesData
}

export function recordingPath(groupId, recording) {
    const recordingsPath = path.join(config.sfu.path, 'recordings')
    const dirname = path.join(recordingsPath, groupId)
    // Sanitize against directory traversal?
    return path.join(dirname, recording)
}

export async function deleteRecording(groupId, recording) {
    const recordingTarget = recordingPath(groupId, recording)
    await fs.remove(recordingTarget)
    const recordings = await loadRecordings(groupId)
    return recordings
}
