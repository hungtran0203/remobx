export declare type EntityOptions = {
    tableName: string;
    keyName?: string;
};
export declare class DataStore {
    instances: any[];
    meta: {};
    indexes: {
        byIds: {};
    };
    computes: Map<any, any>;
    constructor();
}
export declare const Entity: (options: EntityOptions) => (target: any) => void;
export declare abstract class Model {
    constructor(data: any);
    static _store: DataStore;
    static _cacheModelInstances: Map<any, any>;
    static getKeyName: () => any;
    static getEntityName: () => any;
    static getInstance: (_id: any) => void;
    static new: (data: any) => any;
    static insert: (data: any, opt?: any) => any;
    static delete(instance: any): any;
    static findOrNew: (data: any, opt?: any) => any;
    static findById: (_id: any) => any;
    static findOne: (cond: any) => any;
    static find: (cond: any, options?: {}) => any;
    getKeyName: () => any;
    getEntityName: () => any;
    getKey(): any;
    update(data: any): void;
    delete(): void;
    get(path: any, defaultValue: any): void;
    getHashKey(prop: any): void;
}
