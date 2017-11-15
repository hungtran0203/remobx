import {ACTIONS} from '../types/actions'

export default class ChangeToken {
    constructor(public table, public _id, public action : ACTIONS, public options={}){}
}
