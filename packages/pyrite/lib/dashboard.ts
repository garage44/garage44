import {config} from './config.ts'

export async function loadStats(groupId) {
    const headers = new Headers()
    const {password, username} = config.sfu.admin || {password: '', username: ''}
    const authHeader = `Basic ${Buffer.from(`${username}:${password}`, 'utf-8').toString('base64')}`
    headers.append('Authorization', authHeader)
    const stats = await (await fetch(`${config.sfu.url}/stats.json`, {headers})).json()
    return stats.find((i) => i.name === groupId)
}
