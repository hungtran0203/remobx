import { ACTIONS } from '../types/actions';
export default class ChangeToken {
    table: any;
    _id: any;
    action: ACTIONS;
    options: {};
    constructor(table: any, _id: any, action: ACTIONS, options?: {});
}
