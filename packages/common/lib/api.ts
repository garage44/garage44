export default class Api {

    async delete(endpoint, data) {
        return await (await fetch(endpoint, {
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'DELETE',
        })).json()
    }

    async get(endpoint, params = null) {
        const url = new URL(endpoint, window.location.origin)
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (!value) {value = ''}
                url.searchParams.append(key, value)
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
        } else {
            return await res.json()
        }
    }

    async post(endpoint, data) {
        return await (await fetch(endpoint, {
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })).json()
    }

    async put(endpoint, data) {
        return await (await fetch(endpoint, {
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'PUT',
        })).json()
    }
}
