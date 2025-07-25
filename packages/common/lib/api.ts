export default class Api {

    async delete(endpoint, data) {
        const response = await fetch(endpoint, {
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'DELETE',
        })
        return await response.json()
    }

    async get(endpoint, params = null) {
        const url = new URL(endpoint, globalThis.location.origin)
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (!value) {value = ''}
                url.searchParams.append(key, String(value))
            })
        }

        const res = await fetch(url, {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'GET',
        })

        if (res.status === 401) {
            return {status: 'unauthorized'}
        }
            return await res.json()

    }

    async post(endpoint, data) {
        const response = await fetch(endpoint, {
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })
        return await response.json()
    }

    async put(endpoint, data) {
        const response = await fetch(endpoint, {
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'PUT',
        })
        return await response.json()
    }
}
