import ChangeToken from './changeToken'
import Transaction from './transaction'
import * as _ from 'lodash'
import * as update from 'immutability-helper'
import sift from 'sift'
import {ACTIONS} from '../types/actions'
import {uuid} from '../utils/uuid'
import * as objUtils from '../utils/object'
import Firebase from './firebase'

class Store {
    private data = {}
    private firebase

    constructor(public options?) {
        // init firebase
        this.firebase = new Firebase(this.options)
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
        return changes        
    }

    private transaction = new Transaction((changes) => {
        changes.map(change => {
            this.firebase.dispatch(change)
        })
    })

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
        // console.log('debug store', this.data)
    }

    public get(table, _id, property?, defaultValue?) {
        return _.get(this.data, `${table}.${_id}${property === undefined ? '' : ('.' + property)}`, defaultValue)
    }
}

const createStore = (options={}) => {
    return new Store(options)
}

export default createStore