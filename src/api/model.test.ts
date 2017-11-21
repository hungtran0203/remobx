import {initStore} from '../core/store'
import ModelMiddleware from '../core/middlewares/model'
import CollectionMiddleware from '../core/middlewares/collection'
import {autorun} from './autorun'
import {whyRun} from './whyRun'
import {transaction} from './transaction'
import {trackTrace} from './trackTrace'
import {Model, Field, Table} from './model'

const store = initStore({middlewares: [ModelMiddleware, CollectionMiddleware]})

@Table({
    tableName: 'items',
})
class ItemModel extends Model {
    @Field()
    public name

    @Field()
    public owner
}

it('delete a row', () => {
    const newItem = {name: 'item2', obj: {prop1: 10}, owner: 'hungtran'}
    const item = ItemModel.insert(newItem)
    
    
    const d = autorun(() => {
        whyRun()
        const model = ItemModel.findOne({name: 'new value'})
        // trackTrace(true)
        console.log('autorun', model)
        if(model) {
            console.log('lllll', model.name, model.owner)            
        }
        else {
            console.log('nananan', model)
        }
        // trackTrace(true)
    })

    // d()
    // console.log('xasdasd')
    // store.delete(table, item[0]._id)
    if(item) {
        transaction(() => {
            item.name = 'new value'
            item.owner = 'abcd'
        })
    }
})