import {createStore} from './store'
import ModelMiddleware from './middlewares/model'
const store = createStore({middlewares: [ModelMiddleware]})

it('insert new row to table', () => {
    const newItem = {name: 'item1', obj: {prop1: 10}}
    const table = 'items'
    store.insert(table, newItem)
    const data = store.query(table, {name: 'item1'}, {_id: 1})
})

it('delete a row', () => {
    const newItem = {name: 'item2', obj: {prop1: 10}}
    const table = 'items'
    store.insert(table, newItem)
    const item = store.query(table, {name: 'item2'}, {_id: 1})

    store.subscribe(ModelMiddleware.tokenBuilder(table, item[0]._id, 'name'), () => {
        console.log('aasdhasdhsadh', store.query(table, {name: 'item2'}, {_id: 1}))
    })

    store.delete(table, {name: 'item2'})
    store.debug()
})