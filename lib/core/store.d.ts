import ChangeToken from './changeToken';
export declare class Store {
    options: any;
    private data;
    private firebase;
    constructor(options?: any);
    insert(table: any, data: any): ChangeToken[];
    update(table: any, _id: any, query: any): ChangeToken[];
    query(table: any, cond: any, selection?: {}): any[];
    find(table: any, id: any, selection?: {}): any;
    delete(table: any, _id: any): ChangeToken[];
    private transaction;
    startTransaction(): void;
    endTransaction(): void;
    private dispatchChanges(changes);
    static _getKey(table: any, data: any): any;
    static _getKeyName(table: any): string;
    debug(): void;
    get(table: any, _id: any, property?: any, defaultValue?: any): any;
    subscribe(...args: any[]): any;
}
export declare const createStore: (options?: {}) => Store;
export declare const initStore: (options?: {}) => any;
export declare const getStore: (initDefault?: boolean) => any;
