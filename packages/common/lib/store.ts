// oxlint-disable-next-line consistent-type-specifier-style
import {type DeepSignal, deepSignal} from 'deepsignal'
import {copyObject, mergeDeep} from '@/lib/utils'

class Store<StateType extends object = object> {

    state: DeepSignal<StateType>
    persistantState?: StateType

    constructor() {
        this.state = deepSignal({} as StateType)
    }

    load(persistantState: StateType, volatileState: Partial<StateType>) {
        this.persistantState = copyObject(persistantState)

        let restoredState = {}
        try {
            restoredState = JSON.parse(localStorage.getItem('store') || '{}')
        } catch {
            restoredState = {}
        }

        Object.assign(this.state, mergeDeep(mergeDeep(persistantState, restoredState), volatileState))
    }

    filterKeys(obj: any, blueprint: any) {
        const result = {}
        for (const key in blueprint) {
            if (Object.hasOwn(obj, key)) {
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

export {Store}
