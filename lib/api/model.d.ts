import { Collection } from './collection';
export declare const Table: (options?: {}) => (target: any) => void;
export declare abstract class Model {
    protected _id: any;
    constructor(_id: any);
    static _cacheModelInstances: Map<any, any>;
    static getKeyName: () => any;
    static getTableName: () => any;
    static getInstance: (_id: any) => any;
    static ensureData: (data: any, options?: {}) => any;
    static new: (data: any) => any;
    static insert: (data: any) => any;
    static findById: (_id: any) => any;
    static findOne: (cond: any) => any;
    static find: (cond: any, options?: {}) => Collection;
    getKeyName: () => any;
    getTableName: () => any;
    getKey(): any;
    update(data: any): void;
    delete(): void;
    get(path: any, defaultValue: any): any;
    getHashKey(prop: any): string;
}
