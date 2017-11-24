import {autorun, Field, Model, Table, hasOne} from '../remobx'

@Table({
    tableName: 'items',
})
export default class Todo extends Model {
    @Field()
    public testId

    @Field({defaultValue: 'New Item'})
    public title

    @Field({defaultValue: true})
    public status

    @Field({defaultValue: false})
    public isCompleted

    @Field()
    public ordering

    @hasOne(() => User)
    public owner

}

@Table({
    tableName: 'notes',
})
class User extends Model {
    @Field()
    public name
}

it('autorun when collection size changes only', () => {
    let testId = 1
    let todoTitle = 'todoTitle'
    const todo = Todo.insert({testId, ordering:0, title: todoTitle})
    let ownerName
    const autoFn = jest.fn().mockImplementation(() => {
        const owner = todo.owner
        ownerName = owner ? owner.name : undefined
    })
    autorun(autoFn)
    expect(autoFn).toHaveBeenCalledTimes(1)
    expect(ownerName).toEqual(undefined)

    const user1 = User.insert({name: 'user1'})
    todo.owner = user1
    expect(autoFn).toHaveBeenCalledTimes(2)
    expect(ownerName).toEqual('user1')

    const user2 = User.insert({name: 'user2'})
    todo.owner = user2
    expect(autoFn).toHaveBeenCalledTimes(3)
    expect(ownerName).toEqual('user2')

    user2.delete()
    expect(autoFn).toHaveBeenCalledTimes(4)
    expect(ownerName).toEqual(undefined)
})

