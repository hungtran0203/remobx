import {autorun, Field, Model, Table} from '../remobx'

@Table({
    tableName: 'items',
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
    const todo = Todo.insert({testId, ordering:0})
    let size
    const autoFn = jest.fn().mockImplementation(() => {
        const todos = Todo.find({testId})
        size = todos.size()
    })
    autorun(autoFn)
    expect(autoFn).toHaveBeenCalledTimes(1)
    expect(size).toBe(1)
    
    Todo.insert({testId, ordering:1})
    expect(autoFn).toHaveBeenCalledTimes(2)
    expect(size).toBe(2)

    todo.title = 'new'
})

it('track changes for orderBy collection', () => {
    let testId = 2
    const todo = Todo.insert({testId, ordering:0})
    let orderings = []
    const todos = Todo.find({testId})
    
    const autoFn = jest.fn().mockImplementation(() => {
        const sortedTodos = todos.orderBy(['ordering'], ['asc'])
        orderings = sortedTodos.lists('ordering')
    })
    autorun(autoFn)
    expect(autoFn).toHaveBeenCalledTimes(1)
    expect(todos.size()).toBe(1)
    expect(orderings).toEqual([0])
    
    Todo.insert({testId, ordering:1})
    expect(autoFn).toHaveBeenCalledTimes(2)
    expect(todos.size()).toBe(2)
    expect(orderings).toEqual([0, 1])
    
    todo.ordering = 10
    expect(autoFn).toHaveBeenCalledTimes(3)
    expect(todos.size()).toBe(2)
    expect(orderings).toEqual([1, 10])
})

it('track changes for filter collection', () => {
    let testId = 3
    const todo = Todo.insert({testId, ordering:0})
    let orderings = []
    const todos = Todo.find({testId})
    
    const autoFn = jest.fn().mockImplementation(() => {
        const filterTodos = todos.filter({status: true})
        orderings = filterTodos.lists('ordering')
    })
    autorun(autoFn)
    expect(autoFn).toHaveBeenCalledTimes(1)
    expect(todos.size()).toBe(1)
    expect(orderings).toEqual([0])
    
    Todo.insert({testId, ordering:1})
    expect(autoFn).toHaveBeenCalledTimes(2)
    expect(todos.size()).toBe(2)
    expect(orderings).toEqual([0, 1])
    
    Todo.insert({testId, status:false})
    expect(autoFn).toHaveBeenCalledTimes(3)
    expect(todos.size()).toBe(3)
    expect(orderings).toEqual([0, 1])
    
})

