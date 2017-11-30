import Connection from '../core/connection'
let _ = require('lodash')
import ModelMiddleware from '../core/middlewares/model'
import globalState from '../core/globalstate'
import {Collection} from './collection'
import {untrack} from './untrack'
import {listDefinitions, setTableKey} from './definition'

export type TableOptions = {
    tableName: string,
    keyName?: string,
    hooks?: TableHooks[],
}

export type TableHooks = {
    type: TableHookType,
    handler: Function
}

export enum TableHookType {
    BEFORE_INSERT = 'beforeInsert',
    AFTER_INSERT = 'afterInsert',
    BEFORE_DELETE = 'beforeDelete',
    AFTER_DELETE = 'afterDelete',
}

const registerTable = (target, options:TableOptions) => {
    const {tableName, keyName = '_id', hooks = []} = options as any
    
    const Model = target
    Model.tableName = tableName
    Model.keyName = keyName
    setTableKey(tableName, keyName)

    /********** static methods **********/
    Model.getKeyName = function() {
        return keyName
    }

    Model.getTableName = function() {
        return tableName
    }

    Model.applyHook = function(name, args, thisArgs) {
        thisArgs = thisArgs || this
        hooks.filter(hook => {
            if(_.get(hook, `type`) === name) {
                const handler = _.get(hook, `handler`)
                if(typeof handler === 'function') {
                    handler.apply(thisArgs, args)
                }
            }
        })
    }

    /********** prototype methods **********/

    Model.prototype.getKeyName = function() {
        return keyName
    }

    Model.prototype.getTableName = function() {
        return tableName
    }

    Model.prototype.applyHook = function(name, args) {
        Model.applyHook(name, args, this)
    }

}

export const Table = (options:TableOptions) => {
    return (target) => {
        registerTable(target, options)
    }
}

export abstract class Model {
    constructor(protected _id){
        this[this.getKeyName()] = _id
    }

    static _cacheModelInstances = new Map()
    static getKeyName: () => any
    static getTableName: () => any

    static getInstance = function (_id) {
        const Model = this
        if(!_id) return null
        if(!this._cacheModelInstances.has(_id)) {
            this._cacheModelInstances.set(_id, new Model(_id))
        }
        return this._cacheModelInstances.get(_id)
    }

    static ensureData = function (data, options={}) {
        // get list of field defined via schema
        const _data = {...data}
        const definitions = listDefinitions(this) as any
        definitions && definitions.forEach((definition, property) => {
            const {ensureData} = definition
            if(typeof ensureData === 'function') {
                ensureData(_data, options)
            }
        })

        return _data
    }

    static new = function (data) {
        return this.insert(data)
    }

    static insert = function (data, opt?) {
        const insertData = this.ensureData(data)

        // hook
        this.applyHook(TableHookType.BEFORE_INSERT, [data, opt])

        const res = Connection.table(this.getTableName()).insert(insertData).run()
        const {changes} = res
        let rtn
        if(Array.isArray(changes) && changes.length) {
            const _id = _.get(changes, '0._id')
            rtn = this.getInstance(_id)
        }

        // hook
        this.applyHook(TableHookType.AFTER_INSERT, [data, opt, changes])
        
        return rtn
    }

    static findOrNew = function (data, opt?) {
        untrack(() => {
            let found = this.findOne(data)
            if(!found) {
                found = this.insert(data)
            }
        })

        let found = this.findOne(data)
        return found
    }

    static findById = function (_id) {
        const Model = this
        const query = Connection.table(Model.getTableName()).findById(_id, {[Model.getKeyName()]: true}).run()
        const {data} = query
        let rtn
        const reactionContext = globalState.getReactionContext()
        if(reactionContext) {
            const token = ModelMiddleware.tokenBuilder(this.getTableName(), _id, Model.getKeyName())
            reactionContext.track(token)
        }
        
        if(data) {
            return this.getInstance(_id)
        }
        return rtn
    }


    static findOne = function (cond) {
        return this.find(cond).first()
    }

    static find = function (cond, options={}) {
        const Model = this
        const valGetter = () => {
            // @TODO: memozie getter result if data is not changed
            const res = Connection.table(Model.getTableName()).find(cond, {[Model.getKeyName()]: true}).run()
            return _.get(res, 'data').map(item => item[Model.getKeyName()])
        }
        return Collection.getInstance(Model, {resolver: valGetter})
    }


    public getKeyName: () => any
    public getTableName: () => any

    public getKey() {
        return this._id
    }

    public update(data) {
        Connection.table(this.getTableName()).update(this.getKey(), data).run()
    }

    public delete() {
        Connection.table(this.getTableName()).delete(this.getKey()).run()
    }

    public get(path, defaultValue) {
        return _.get(this, path, defaultValue)
    }

    public getHashKey(prop) {
        return prop === undefined ? `${this.getTableName()}::${this.getKey()}`: `${this.getTableName()}::${this.getKey()}::${prop}`
    }
}

