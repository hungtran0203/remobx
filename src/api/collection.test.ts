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
    ItemModel.insert({name: 'item1', owner: 'hungtran'})
    ItemModel.insert({name: 'item3', owner: 'hungtran'})
    
    const d = autorun(() => {
        // whyRun()
        // trackTrace(true)
        const col = ItemModel.find({owner: 'hungtran'})
        console.log('autorun', col.all())
        const filtered = col.filter((item, index) => {
            console.log('asdasdasd', item.name)
            return true
        })

        console.log('dldldldld', filtered.size())
        // if(model) {
        //     console.log('lllll', model.name, model.owner)            
        // }
        // else {
        //     console.log('nananan', model, store.debug())
        // }
        // trackTrace(false)
    })

    // d()
    // console.log('xasdasd')
    // store.delete(table, item[0]._id)
    if(item) {
        transaction(() => {
            item.update({
                name: {$set: 'new value'}
            })
    
            item.update({
                owner: {$set: 'abcd'}
            })

            item.delete()
        })
    }
})