import {autorun, Field, Model, Table} from '../remobx'

@Table({
    tableName: 'items',
})
export default class Todo extends Model {
    @Field({defaultValue: 'New Item'})
    public title

    @Field({})
    public status

    @Field({defaultValue: false})
    public isCompleted

}

const todo = Todo.insert({status: true})

it('autorun when model property size changes only', () => {
    let title
    let newTitle = 'new title'
    let oldTitle = todo.title
    const autoFn = jest.fn().mockImplementation(() => {
        title = todo.title
    })
    autorun(autoFn)
    expect(autoFn).toHaveBeenCalledTimes(1)
    expect(title).toBe(oldTitle)
    
    const newTodo = Todo.insert({status: true})
    expect(autoFn).toHaveBeenCalledTimes(1)
    expect(title).toBe(oldTitle)
    
    todo.title = newTitle
    expect(autoFn).toHaveBeenCalledTimes(2)
    expect(title).toBe(newTitle)
    
    newTodo.delete()
    expect(autoFn).toHaveBeenCalledTimes(2)
    expect(title).toBe(newTitle)
})

it('autorun when collection size changes only', () => {
    let size
    const autoFn = jest.fn().mockImplementation(() => {
        const todos = Todo.find({status: true})
        size = todos.size()
    })
    autorun(autoFn)
    expect(autoFn).toHaveBeenCalledTimes(1)
    expect(size).toBe(1)
    
    const newTodo = Todo.insert({status: true})
    expect(autoFn).toHaveBeenCalledTimes(2)
    expect(size).toBe(2)
    
    todo.title = 'change title'
    expect(autoFn).toHaveBeenCalledTimes(2)
    expect(size).toBe(2)
    
    Todo.insert({})
    expect(autoFn).toHaveBeenCalledTimes(2)
    expect(size).toBe(2)
    
    newTodo.delete()
    expect(autoFn).toHaveBeenCalledTimes(3)
    expect(size).toBe(1)
})

it('tail tracking for nested autorun function', () => {
    let testId = 'tail tracking for nested autorun function'
    let todoTitle = 'todoTitle'
    const todo1 = Todo.insert({testId, ordering:0, title: `${todoTitle}_1`})
    const todo2 = Todo.insert({testId, ordering:0, title: `${todoTitle}_2`})

    let todo1Title, todo2Title
    const nestedAutoFn = jest.fn().mockImplementation(() => {
        const todo = Todo.findById(todo2.getKey())
        // tail tracking will be lose, update it here
        todo2Title = todo.title
    })
    const autoFn = jest.fn().mockImplementation(() => {
        const todo = Todo.findById(todo1.getKey())
        autorun(nestedAutoFn)

        // define tail tracking 
        todo1Title = todo.title
    })
    autorun(autoFn)
    expect(autoFn).toHaveBeenCalledTimes(1)

    todo1.title = 'change'
    expect(autoFn).toHaveBeenCalledTimes(2)
})