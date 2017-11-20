import Connection from '../core/connection'
import * as _ from 'lodash'
import {getStore} from '../core/store'
import ModelMiddleware from '../core/middlewares/model'
import CollectionMiddleware from '../core/middlewares/collection'
import globalState from '../core/globalstate'



const registerTable = (target, options={}) => {
    const {tableName, keyName = '_id'} = options as any

    const Model = target
    Model.tableName = tableName
    Model.keyName = keyName

    /********** static methods **********/
    Model.getKeyName = function() {
        return keyName
    }

    Model.getTableName = function() {
        return tableName
    }

    /********** prototype methods **********/

    Model.prototype.getKeyName = function() {
        return keyName
    }

    Model.prototype.getTableName = function() {
        return tableName
    }

}

export const Table = (options={}) => {
    return (target) => {
        registerTable(target, options)
    }
}

export abstract class Model {
    protected data = {}
    constructor(protected _id){
        
    }

    static _cacheModelInstances = new Map()
    static getKeyName: () => any
    static getTableName: () => any

    static insert = function (data) {
        const Model = this
        const res = Connection.table(this.getTableName()).insert(data).run()
        const {changes} = res
        let rtn
        if(Array.isArray(changes) && changes.length) {
            const _id = _.get(changes, '0._id')
            rtn = new Model(_id)
            this._cacheModelInstances.set(_id, rtn)
        }
        return rtn        
    }

    static findById = function (_id) {
        const Model = this
        const query = Connection.table(Model.getTableName()).find({[Model.getKeyName()]: _id}, {[Model.getKeyName()]: true}).run()
        const {data} = query
        let rtn
        if(Array.isArray(data)) {
            const _id = _.get(data, `0.${Model.getKeyName()}`)
            if(!this._cacheModelInstances.has(_id)) {
                this._cacheModelInstances.set(_id, new Model(_id))
            }
            rtn = this._cacheModelInstances.get(_id)
        }
        return rtn
    }


    static findOne = function (cond) {
        const Model = this
        const valGetter = () => {
            const res = Connection.table(Model.getTableName()).find(cond, {[Model.getKeyName()]: true}).run()
            const {data} = res as any
            if(Array.isArray(data) && data.length) {
                return _.get(data, `0.${Model.getKeyName()}`)
            }
        }
        let rtn
        const _id = valGetter()

        if(_id) {
            if(!this._cacheModelInstances.has(_id)) {
                this._cacheModelInstances.set(_id, new Model(_id))
            }
            rtn = this._cacheModelInstances.get(_id)
        }

        // track enable
        if(globalState._runningReaction) {
            const token = CollectionMiddleware.tokenBuilder({cond, val: _id, valGetter, table: Model.getTableName()})
            globalState._runningReaction.track(token)
        }
    
        return rtn
    }

    static find = function (cond) {
        const Model = this
        const query = Connection.table(Model.getTableName()).find(cond).run()
        const {data} = query
        let rtn
        if(Array.isArray(data)) {
            // rtn = new Collection(Model, cond, data)
        }
        return rtn
    }


    public getKeyName: () => any
    public getTableName: () => any

    public getKey() {
        return this._id
    }

    public update(data) {
        Connection.table(this.getTableName()).update(this.getKey(), data).run()
    }

    public getHashKey(prop) {
        return prop === undefined ? `${this.getTableName()}::${this.getKey()}`: `${this.getTableName()}::${this.getKey()}::${prop}`
    }
}

export const Field = (options={}) => (target, property) => {
    const defaultValue = _.get(options, 'defaultValue')
    Object.defineProperty(target, property, {
        get: function() {
            // setup property tracking if needed
            const store = getStore()
            if(globalState._runningReaction) {
                const token = ModelMiddleware.tokenBuilder(this.getTableName(), this.getKey(), property)
                globalState._runningReaction.track(token)
            }
            const propVal = store.get(this.getTableName(), this._id, property, defaultValue)
            return propVal
        },
        set: function(newVal) {
            return newVal
        },
        enumerable: true,
        configurable: true
    })
}
