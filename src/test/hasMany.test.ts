import {autorun, Field, Model, Table, hasMany} from '../remobx'

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

    @hasMany(() => Note)
    public notes

}

@Table({
    tableName: 'notes',
})
class Note extends Model {
    @Field()
    public text
}

it('autorun when collection size changes only', () => {
    let testId = 1
    let todoTitle = 'todoTitle'
    const todo = Todo.insert({testId, ordering:0, title: todoTitle})
    const todoId = todo.getKey()
    let texts
    const notes = todo.notes
    const autoFn = jest.fn().mockImplementation(() => {
        texts = notes.lists('text')
    })
    autorun(autoFn)
    expect(autoFn).toHaveBeenCalledTimes(1)
    expect(texts).toEqual([])

    const note1 = Note.insert({text: 'mynote1'})
    todo.notes.push(note1)
    expect(autoFn).toHaveBeenCalledTimes(2)
    expect(texts).toEqual(['mynote1'])

    todo.notes.push(Note.insert({text: 'mynote2'}))
    expect(autoFn).toHaveBeenCalledTimes(3)
    expect(texts).toEqual(['mynote1', 'mynote2'])

    notes.remove({text: 'mynote1'})
    expect(autoFn).toHaveBeenCalledTimes(4)
    expect(texts).toEqual(['mynote2'])
    // Todo.insert({testId, ordering:1})
    // expect(autoFn).toHaveBeenCalledTimes(1)

    // todo.delete()
    // expect(autoFn).toHaveBeenCalledTimes(2)
    // expect(title).toBe(undefined)

})

