import {autorun} from '../autorun'
import {transaction} from '../transaction'
import {Model, Field, Table} from '../model'
import {hasOne} from './hasOne'

@Table({
    tableName: 'items',
})
class ItemModel extends Model {
    @Field()
    public name

    @hasOne(() => UserModel)
    public owner
}

@Table({
    tableName: 'users',
})
class UserModel extends Model {
    @Field()
    public name

}


it('hasOne relation', () => {
    const user = UserModel.insert({name: 'hungtran'})
    const item = ItemModel.insert({name: 'item1', owner: user})
    
    autorun(() => {
        console.log('autorun', item)
        console.log('lllll', item.name, item.owner)
        if(item.owner) {
            console.log('owner is', item.owner.name)
        }

    })

    if(item) {
        transaction(() => {
            // item.name = 'new value'
            item.owner = user
        })
    }

    user.delete()
})