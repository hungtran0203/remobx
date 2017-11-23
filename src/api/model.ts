import Connection from '../core/connection'
import * as _ from 'lodash-es'
import CollectionMiddleware from '../core/middlewares/collection'
import globalState from '../core/globalstate'
import {Collection} from './collection'
import {listDefinitions} from './definition'

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
    constructor(protected _id){}

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

    static insert = function (data) {
        const res = Connection.table(this.getTableName()).insert(this.ensureData(data)).run()
        const {changes} = res
        let rtn
        if(Array.isArray(changes) && changes.length) {
            const _id = _.get(changes, '0._id')
            rtn = this.getInstance(_id)
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
            rtn = this.getInstance(_id)
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
            rtn = rtn = this.getInstance(_id)
        }

        // track enable
        const reactionContext = globalState.getReactionContext()
        if(reactionContext) {
            const token = CollectionMiddleware.tokenBuilder({cond, val: _id, valGetter, table: Model.getTableName()})
            reactionContext.track(token)
        }
    
        return rtn
    }

    static find = function (cond, options={}) {
        const Model = this
        const valGetter = () => {
            const res = Connection.table(Model.getTableName()).find(cond, {[Model.getKeyName()]: true}).run()
            return _.get(res, 'data').map(item => item[Model.getKeyName()])
        }
        const items = valGetter()
        let rtn = Collection.getInstance(Model, items, options)

        // track enable
        const reactionContext = globalState.getReactionContext()
        if(reactionContext) {
            const token = CollectionMiddleware.tokenBuilder({cond, val: items, valGetter, table: Model.getTableName()})
            reactionContext.track(token)
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

