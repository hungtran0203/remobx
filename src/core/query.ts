import {ACTIONS} from '../types/actions'
let _ = require('lodash')
import {getStore} from './store'

export class QueryRes {
    public data
    public changes
}

const dispatcher = (table, action) => {
    const {type} = action
    const rtn = new QueryRes()
    const store = getStore()
    if(!store) {
        return rtn
    }
    switch(type){
        case ACTIONS.INSERT:
            rtn.changes = store.insert(table, _.get(action, 'data'))
            break;
        case ACTIONS.UPDATE:
            rtn.changes = store.update(table, _.get(action, '_id'), _.get(action, 'query'))
            break;
        case ACTIONS.DELETE:
            rtn.changes = store.delete(table, _.get(action, '_id'))
            break;
        case ACTIONS.QUERY:
            rtn.data = store.query(table, _.get(action, 'cond'), _.get(action, 'selection'))
            break;
    }
    return rtn
}

export class Query {
    private actions = []
    constructor(private options={}) {}

    public findById(id): Query {
        this.actions.push({
            type: ACTIONS.QUERY,
        })
        return this
    }

    public findOne(): Query {
        return this
    }

    public find(cond, selection?):Query {
        this._resetAction()
        this.actions.push({
            type: ACTIONS.QUERY,
            cond,
            selection,
        })
        return this
    }

    public insert(data) {
        //TODO: perform data validation base on Model schema here
        this._resetAction()
        this.actions.push({
            type: ACTIONS.INSERT,
            data,
        })
        return this
    }

    public update(id, query) {
        this._resetAction()
        this.actions.push({
            type: ACTIONS.UPDATE,
            _id: id,
            query,
        })
        return this
    }

    private _resetAction() {
        this.actions = []
    }

    public replace() {

    }

    public delete(id) {
        this._resetAction()
        this.actions.push({
            type: ACTIONS.DELETE,
            _id: id,
        })
        return this
    }

    public run(cb?){
        let rtn
        this.actions.map(action => {
            rtn = dispatcher(this._getTableName(), action)
        })
        return rtn
    }

    private _getTableName() {
        return _.get(this.options, 'tableName')
    }
}
