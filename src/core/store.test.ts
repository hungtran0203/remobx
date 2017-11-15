import createStore from './store'
const store = createStore()

it('insert new row to table', () => {
    const newItem = {name: 'layer1', obj: {prop1: 10}}
    const table = 'items'
    store.insert(table, newItem)
    store.debug()
    const data = store.query(table, {name: 'layer1'}, {_id: 1})
    console.log('ddddd', data)
})