import {autorun, Field, Model, Table, TableHookType} from '../remobx'

@Table({
    tableName: 'items',
    hooks: [{
        type: TableHookType.BEFORE_INSERT,
        handler: function (data, opt) {
            console.log('ddddd', data, opt, this.getKeyName())
        }
    }]
})
export default class Todo extends Model {
    @Field({defaultValue: 'New Item'})
    public title

    @Field({defaultValue: true})
    public status

    @Field({defaultValue: false})
    public isCompleted

    @Field()
    public ordering

    @Field()
    public testId
}


it('autorun when collection size changes only', () => {
    let testId = 1
    let todoTitle = 'todoTitle'
    const todo = Todo.insert({testId, ordering:0, title: todoTitle})
    const todoId = todo.getKey()
    let title
    const autoFn = jest.fn().mockImplementation(() => {
        const found = Todo.findById(todoId)
        title = found ? found.title : undefined
    })
    autorun(autoFn)
    expect(autoFn).toHaveBeenCalledTimes(1)
    expect(title).toBe(todoTitle)
    
    Todo.insert({testId, ordering:1})
    expect(autoFn).toHaveBeenCalledTimes(1)

    todo.delete()
    expect(autoFn).toHaveBeenCalledTimes(2)
    expect(title).toBe(undefined)

    todo.title = 'new'
})

