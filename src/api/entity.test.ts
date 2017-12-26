import {Entity, Model} from './entity'
import {Column} from './column'
import {hasOne} from './relations/hasOne'
import {hasMany} from './relations/hasMany'

import {autorun, transaction, observable, whyRun, extras} from 'mobx'

@Entity({
    tableName: 'users',
})
class User extends Model {
    @Column()
    public testId: string

    @Column()
    public name = "Hung Tran"

}


@Entity({
    tableName: 'items',
})
class Todo extends Model {
    @Column()
    public testId: string

    @Column({defaultValue: 'title'})
    public title: string

    @Column()
    public data = {field1: 'x', field2: 'y'}

    @Column()
    public arr = [1,2,3]

    @hasOne(() => User)
    public owner = undefined

    @hasMany(() => User)
    public followers = []
}

it('debug1', () => {
    const todo = Todo.insert({_id: `_init`, testId: 'abd'})
    autorun(() => {
        console.log(Object.keys(todo))
        console.log(todo.title, todo, todo.data, todo.arr)
    })
    todo.title = 'xyz'
})

it('autorun when collection size changes only', () => {
    // console.log('ddldlasldxxx', extras.getGlobalState())
    Todo.insert({_id: `_init`, testId: 'abd'})

    const owner = User.insert({})
    console.log('x')
    const disposer = autorun(() => {
        console.log('trigger autorun')
        const cond = {testId: 'abd'}
        console.log('1111', Todo.find(cond).length)
        console.log('2222', Todo.find(cond).map(todo => todo.owner))
        // console.log(Todo.findById('_3'))

        // console.log('ghahahahahahah', extras.getGlobalState().trackingDerivation)
    })

    let instance
    transaction(() => {
        instance = Todo.insert({_id: '_1', testId: 'abdx'})
            // instance.delete()
    })
    transaction(() => {
        for(let i = 0; i < 2; i ++) {
            Todo.insert({_id: `_x${i}`, testId: 'abd'}).owner = owner
        }
    })

    owner.name ="xyz"
    const owner2 = User.insert({})
    instance.owner = owner2
    // disposer()

    Todo.insert({_id: `_init2`, testId: 'abd'})

    const disposer2 = autorun(() => {
        console.log('trigger autorun 2')
        const cond = {testId: 'abd'}
        console.log('3333', Todo.find(cond).length)
    })

    instance.arr = 'hung'
    // instance.delete()
    instance.testId = 'abd'
    // transaction(() => {
    //     Todo.insert({_id: '_3', testId: 'abd'})
    //     console.log('dmdmdmdmamsdmasdasdm')
    //     Todo.insert({_id: '_4', testId: 'abd'})
    
    // })
})


it('hasMany relations', () => {
    let testId = 'hasMany'
    let instance = Todo.insert({_id: `_init`, testId})
    const followers = []
    for(let i = 0; i < 2; i ++) {
        followers.push(User.insert({name: `user_${i}`}))
    }

    const disposer = autorun(() => {
        console.log('trigger autorun')
        const cond = {testId}
        console.log('1111', Todo.find(cond).map(item => item.followers.length))
        // console.log('2222', Todo.find(cond))
    })

    transaction(() => {
        instance.followers = followers
    })

    instance.followers.push(User.insert({name: 'hung'}))
})


it('debug async update column', () => {
    let testId = 'hasMany'
    let instance = Todo.insert({_id: `_init`, testId})
    const followers = []
    for(let i = 0; i < 2; i ++) {
        followers.push(User.insert({name: `user_${i}`}))
    }

    const disposer = autorun(() => {
        console.log('trigger autorun')
        const cond = {testId}
        console.log('1111', Todo.find(cond).map(item => item.followers.length))
        // console.log('2222', Todo.find(cond))
    })

    transaction(() => {
        instance.followers = followers
    })

    instance.followers.push(User.insert({name: 'hung'}))
})

