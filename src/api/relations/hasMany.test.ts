import {autorun} from '../autorun'
import {transaction} from '../transaction'
import {Model, Field, Table} from '../model'
import {hasMany} from './hasMany'

@Table({
    tableName: 'items',
})
class ItemModel extends Model {
    @Field()
    public name

    @hasMany(() => CommentModel)
    public comments
}

@Table({
    tableName: 'commnents',
})
class CommentModel extends Model {
    @Field()
    public text

}


it('hasMany relation', () => {
    const newItem = {name: 'item1'}
    const item = ItemModel.insert(newItem)
    const comments = [CommentModel.insert({text: 'comment1'}), CommentModel.insert({text: 'comment2'})]
    
    autorun(() => {
        console.log('autorun')
        console.log('lllll', item.name)
        if(item.comments) {
            console.log('owner is', item.comments.size(), item.comments.lists('text'))
            console.log(item.comments.sortBy(['text']).lists('text'))

            const m = item.comments.find({text: 'comment'})
            if(m) {
                console.log('asdasdasd', m.getKey())
            }
        }

    })

    if(item) {
        transaction(() => {
            item.comments = comments
            item.comments.push(CommentModel.insert({text: 'comment'}))
            item.comments.push(CommentModel.insert({text: 'comment4'}))
            item.comments.pop()
            item.comments.shift()
        })
    }

    // comments[0].text = 'new text'
})