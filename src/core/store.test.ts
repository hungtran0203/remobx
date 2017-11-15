import createStore from './store'
import ModelTokenParser from './tokenParsers/model'
const store = createStore({tokenParsers: [ModelTokenParser]})

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
    store.delete(table, {name: 'item2'})
    store.debug()
})