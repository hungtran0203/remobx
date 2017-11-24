import ChangeToken from './changeToken'
import Transaction from './transaction'

let _ = require('lodash')
let update = require('immutability-helper')
let sift = require('sift')

import {ACTIONS} from '../types/actions'
import {uuid} from '../utils/uuid'
import * as objUtils from '../utils/object'
import Firebase from './firebase'

import {invariant} from '../utils'

export class Store {
    private data = {}
    private firebase

    constructor(public options?) {
        // init firebase
        this.firebase = new Firebase(this.options, this)
    }

    public insert(table, data): ChangeToken[] {
        const _id = Store._getKey(table, data)
        _.set(this.data, `${table}.${_id}`, {...data, [Store._getKeyName(table)]: _id})
        const changes = [new ChangeToken(table, _id, ACTIONS.INSERT)]
        // dispatch changes
        this.dispatchChanges(changes)
        return changes                
    }

    public update(table, _id, query): ChangeToken[] {
        const changes = []
        const oldData = this.data[table][_id]
        if(_id) {
            _.set(this.data, `${table}.${_id}`, update(this.data[table][_id], query))
        }
        if(oldData !== this.data[table][_id]) {
            changes.push(new ChangeToken(table, _id, ACTIONS.UPDATE, {nextVal: this.data[table[_id]], prevVal: oldData}))
        }
        // dispatch changes
        this.dispatchChanges(changes)
        return changes
    }

    public query(table, cond, selection={}) {
        const tableData = _.get(this.data, table, {})
        const compareFunc = (obj) => !!sift(cond, [obj]).length
        const items = []
        Object.keys(tableData).map(_id => {
            if(compareFunc(tableData[_id])) {
                const item = Object.keys(selection).length ? objUtils.select(tableData[_id], selection) : tableData[_id]
                items.push(item)
            }
        })    
        return items
    }

    public delete(table, _id): ChangeToken[] {
        const changes = []
        let ids
        let keyName = Store._getKeyName(table)
        if(typeof _id !== 'string') {
            ids = this.query(table, _id, {[keyName]: true}).map(item => item[keyName])
        }
        else if(!Array.isArray(_id)) {
            ids = [_id]
        }
        else {
            ids = _id
        }
        ids.map(_id => {
            const oldData = _.get(this.data, `${table}.${_id}`)
            if(oldData !== undefined) {
                delete this.data[table][_id]
                changes.push(new ChangeToken(table, _id, ACTIONS.DELETE, {prevVal: oldData}))
            }
        })

        // dispatch changes
        this.dispatchChanges(changes)
        return changes
    }

    private transaction = new Transaction(changes => this.firebase.dispatch(changes))

    public startTransaction() {
        this.transaction.start()
    }

    public endTransaction() {
        this.transaction.end()        
    }

    private dispatchChanges(changes) {
        this.startTransaction()
        this.transaction.queueChanges(changes)
        this.endTransaction()
    }
    
    static _getKey(table, data) {
        const keyName = this._getKeyName(table)
        return _.get(data, keyName, uuid())
    }

    static _getKeyName(table) {
        const keyName = '_id'
        return keyName
    }

    public debug() {
        console.log('debug store', this.data)
    }

    public get(table, _id, property?, defaultValue?) {
        return _.get(this.data, `${table}.${_id}${property === undefined ? '' : ('.' + property)}`, defaultValue)
    }

    public subscribe(...args) {
        return this.firebase.subscribe(...args)
    }
}

export const createStore = (options={}) => {
    return new Store(options)
}

let _store
export const initStore = (options={}) => {
    if(!_store) {
        _store = new Store(options)
    }
    return _store
}

import ModelMiddleware from './middlewares/model'
import CollectionMiddleware from './middlewares/collection'

const initDefaultStore = () => {
    initStore({middlewares: [ModelMiddleware, CollectionMiddleware]})
}

export const getStore = (initDefault=true) => {
    if(initDefault && !_store) {
        initDefaultStore()
    }
    invariant(_store, 'Store is not initialized, use "initStore(options) before gettings access to store.')
    return _store
}