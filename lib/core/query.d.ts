export declare class QueryRes {
    data: any;
    changes: any;
}
export declare class Query {
    private options;
    private actions;
    constructor(options?: {});
    findById(id: any, selection?: any): Query;
    findOne(): Query;
    find(cond: any, selection?: any): Query;
    insert(data: any): this;
    update(id: any, query: any): this;
    private _resetAction();
    replace(): void;
    delete(id: any): this;
    run(cb?: any): any;
    private _getTableName();
}
