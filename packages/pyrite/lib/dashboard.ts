import {config} from './config.ts'

export async function loadStats(groupId) {
    const headers = new Headers()
    const {username, password} = config.sfu.admin || {username: '', password: ''}
    const authHeader = `Basic ${Buffer.from(`${username}:${password}`, 'utf-8').toString('base64')}`
    headers.append('Authorization', authHeader)
    const stats = await (await fetch(`${config.sfu.url}/stats.json`, {headers})).json()
    return stats.find((i) => i.name === groupId)
}
