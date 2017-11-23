import ChangeToken from '../changeToken';
export declare const PARSER_TYPE = "model";
export default class ModelMiddleware {
    private store;
    static type: string;
    static tokenBuilder(tableName: any, _id: any, prop: any): {
        type: string;
        table: any;
        _id: any;
        prop: any;
    };
    constructor(store: any);
    protected data: {};
    private subscribers;
    private trackedTagsByReaction;
    private parseSubsToken(token);
    private setTrackedPropVal(reaction, tag, prop, val);
    private getTrackedProps(reaction, tag);
    subscribe(token: any, reaction: any): () => void;
    dispatch(change: ChangeToken): any[];
    private serializeToken(token);
}
