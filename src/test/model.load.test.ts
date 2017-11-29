import {autorun, Field, Model, Table, transaction, whyRun} from '../remobx'

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


const wait = (delay) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, delay)
    })
}

it('continously insert new model instance', async () => {
    let testId = 'continously insert new model instance'
    let todoTitle = 'todoTitle'
    Todo.insert({testId, ordering:0, title: todoTitle})
    const _todoItemsFns = new Map()
    const getTodoItemAutoRun = (todoId) => {
        if(!_todoItemsFns.has(todoId)) {
            const fn = jest.fn().mockImplementation(() => {
                const found = Todo.findById(todoId)
                let title = found ? found.title : undefined
                title
            })
            _todoItemsFns.set(todoId, fn)
        }
        return _todoItemsFns.get(todoId)
    }

    const autoFn = jest.fn().mockImplementation(() => {
        const todos = Todo.find({})
        todos.all().map(todo => {
            if(!_todoItemsFns.has(todo.getKey())) {
                autorun(getTodoItemAutoRun(todo.getKey()))                
            }
        })
        // tail tracking will be lose, update it here
    })
    autorun(autoFn)
    
    const MaxRow = 1000
    const taskCount = 3
    const tasks = []
    for(let i = 0; i < taskCount; i++) {
        tasks.push(i)
    }
    let todoOrdering = 0
    await Promise.all(tasks.map(i => {
        return new Promise(async (resolve, reject) => {
            transaction(() => {
                for(let i = 0; i < MaxRow; i ++) {
                    Todo.insert({title: `new todo ${todoOrdering++}`})
                }
            })
            await wait(1000)
            resolve()
        })
    }))

    expect(autoFn).toHaveBeenCalledTimes(taskCount + 1)
    
    _todoItemsFns.forEach(fn => {
        expect(fn).toHaveBeenCalledTimes(1)
    })
    await wait(1000)
})

