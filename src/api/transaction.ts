import {getStore} from '../core/store'
export const transaction = (worker) => {
    const store = getStore()
    if(store && typeof worker === 'function') {
        store.startTransaction()
        worker()
        store.endTransaction()
    }
}
