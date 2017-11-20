import {initStore} from '../core/store'
import ModelMiddleware from '../core/middlewares/model'
import {autorun} from './autorun'
import globalState from '../core/globalstate'

const store = initStore({middlewares: [ModelMiddleware]})

it('delete a row', () => {
    const newItem = {name: 'item2', obj: {prop1: 10}}
    const table = 'items'
    store.insert(table, newItem)
    const item = store.query(table, {name: 'item2'}, {_id: 1})

    autorun(() => {
        console.log('autorun', item, item[0]._id)
        if(globalState._runningReaction) {
            console.log('rrrr')
            const token = ModelMiddleware.tokenBuilder(table, item[0]._id, 'name')
            store.subscribe(token, globalState._runningReaction)            
        }
    })

    store.delete(table, item[0]._id)
})