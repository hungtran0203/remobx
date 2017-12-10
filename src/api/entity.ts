let _ = require('lodash')
import {setEntityKey} from './definition'

import {observable, untracked, observe, extendObservable, computed} from 'mobx'
import { uuid } from '../utils/uuid';

export type EntityOptions = {
    tableName: string,
    keyName?: string,
}

export class DataStore {
    @observable
    public instances = []

    @observable
    public meta = {
    }

    @observable
    public indexes = {
        byIds: {},
    }

    @observable
    public computes = new Map()

    constructor() {
        observe(this.instances, (change) => {
            // console.log('chachc', change)
            const {added, removed} = change as any
            added.map(instance => {
                const id = instance.getKey()
                if(this.indexes.byIds.hasOwnProperty(id)) {
                    this.indexes.byIds[id] = instance
                }
            })
            removed.map(instance => {
                const id = instance.getKey()
                if(this.indexes.byIds.hasOwnProperty(id)) {
                    this.indexes.byIds[id] = undefined
                }
            })
        })
    }
}

const registerEntity = (target, options:EntityOptions) => {
    const {tableName, keyName = '_id'} = options as any
    
    const Model = target
    Model.tableName = tableName
    Model.keyName = keyName
    setEntityKey(tableName, keyName)

    /********** static methods **********/
    Model.getKeyName = function() {
        return keyName
    }

    Model.getEntityName = function() {
        return tableName
    }

    /********** prototype methods **********/

    Model.prototype.getKeyName = function() {
        return keyName
    }

    Model.prototype.getEntityName = function() {
        return tableName
    }

}

export const Entity = (options:EntityOptions) => {
    return (target) => {
        registerEntity(target, options)
    }
}

export abstract class Model {
    constructor(data){
        const _sanitizedData = data
        Object.assign(this, {[this.getKeyName()]: uuid()}, _sanitizedData)
    }

    public static _store = new DataStore()

    static _cacheModelInstances = new Map()
    static getKeyName: () => any
    static getEntityName: () => any

    static getInstance = function (_id) {
    }

    static new = function (data) {
        return this.insert(data)
    }

    static insert = function (data, opt?) {
        const Model = this

        const instance = new Model(data)
        this._store.instances.push(instance)
        return instance
    }

    static delete (instance) {
        return this._store.instances['remove'].apply(this._store.instances, [instance])
    }

    static findOrNew = function (data, opt?) {
        untrack(() => {
            const rtn = this.findOne(data)
            if(!rtn) {
                return this.insert(data, opt)
            }    
        })

        return this.findOne(data)
    }

    static findById = function (_id) {
        if(this._store.indexes.byIds.hasOwnProperty(_id)) {
            return this._store.indexes.byIds[_id]
        }
        else {
            untracked(() => {
                const instance = this._store.instances.find(instance => instance[this.getKeyName()] === _id)
                extendObservable(this._store.indexes.byIds, {
                    [_id]: observable.ref(instance)
                })
            })
            return this._store.indexes.byIds[_id]
        }
    }


    static findOne = function (cond) {
        return this.find(cond)[0]
    }

    static find = function (cond, options={}) {
        //TODO: serialize cond to a hash string 
        
        let condHash = JSON.stringify(cond)
        if(this._store.computes.has(condHash)) {
            return this._store.computes.get(condHash).get()
        }
        else {
            const genComputor = _.memoize((instance) => {
                return computed(() => {
                    const isMatched = _.isMatch(instance, cond)
                    return {isMatched, instance}
                }, {equals: (a, b) => a.isMatched === b.isMatched})
            })

            // check for new inserted item
            let computedVal
            untracked(() => {
                // gen computor for current instances
                let len
                let instances = []
                len = this._store.instances.length

                for(let i = 0; i < len; i ++) {
                    instances[i] = genComputor(this._store.instances[i])
                }
                const computes = observable(instances)

                const disposer = observe(this._store.instances, (change) => {
                    const {added, removed} = change as any
                    added.map(instance => {
                        computes.push(genComputor(instance))
                    })
                    removed.map(instance => {
                        const computor = genComputor(instance)
                        computes.remove(computor)
                    })
                })
            
                let prevResultHash
                let nextResultHash = ''
                computedVal = computed(() => {
                    nextResultHash = ''
                    const rtn = computes.reduce((acc, compute) => {
                        const {isMatched, instance} = compute.get()
                        if(!!isMatched) {
                            nextResultHash = nextResultHash + ';' + instance.getKey()
                            acc.push(instance)
                        }
                        return acc
                    }, [])
                    // for the first computing, set hash
                    if(prevResultHash === undefined) {
                        prevResultHash = nextResultHash
                    }
                    return rtn
                }, {
                    equals: () => {
                        const isEqual = prevResultHash === nextResultHash
                        prevResultHash = nextResultHash
                        return isEqual
                    }
                })

                // setup disposer for computedVal
                const _onBecomeUnobserved = computedVal.onBecomeUnobserved.bind(computedVal)
                computedVal.onBecomeUnobserved = () => {
                    _onBecomeUnobserved()

                    // dispose listener on add/remove instance
                    disposer()

                    // remove to computes cached
                    this._store.computes.delete(condHash)
                }
            })

            this._store.computes.set(condHash, computedVal)
            return this._store.computes.get(condHash).get()
        }
    }


    public getKeyName: () => any
    public getEntityName: () => any

    public getKey() {
        return this[this.getKeyName()]
    }

    public update(data) {
    }

    public delete() {
        const Model = this.constructor
        Model['delete'].apply(Model, [this])
    }

    public get(path, defaultValue) {
    }

    public getHashKey(prop) {
    }

    // public doActions(actions, options?) {
    //     const action = {type: 'SET', data: {name: 'hung'}}
    // }
}

