import ChangeToken from '../changeToken';
export declare const PARSER_TYPE = "collection";
export default class CollectionMiddleware {
    private store;
    static type: string;
    static tokenBuilder(options: any): any;
    constructor(store: any);
    protected data: {};
    private subscribers;
    private trackedTagsByReaction;
    private parseSubsToken(token);
    private setTrackedToken(reaction, tag, cond, token);
    private getTrackedTokens(reaction, tag);
    subscribe(token: any, reaction: any): () => void;
    dispatch(change: ChangeToken): any[];
    private serializeToken(token);
}
