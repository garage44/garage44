import {copyObject, mergeDeep} from '@/lib/utils'

import {deepSignal} from 'deepsignal'

class Store {

    state = deepSignal({})

    load(persistantState, volatileState) {
        this.persistantState = copyObject(persistantState)

        let restoredState
        try {
            restoredState = JSON.parse(localStorage.getItem('store'))
        } catch {
            restoredState = {}
        }

        Object.assign(this.state, mergeDeep(mergeDeep(persistantState, restoredState), volatileState))
    }

    filterKeys(obj, blueprint) {
        const result = {}
        for (const key in blueprint) {
            if (obj.hasOwnProperty(key)) {
                if (typeof blueprint[key] === 'object' && blueprint[key] !== null) {
                    result[key] = this.filterKeys(obj[key], blueprint[key])
                } else {
                    result[key] = obj[key]
                }
            }
        }
        return result
    }

    save() {
        localStorage.setItem('store', JSON.stringify(this.filterKeys(this.state, this.persistantState)))
    }
}

export default Store
