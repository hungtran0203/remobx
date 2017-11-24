import ChangeToken from '../changeToken';
import { Reaction } from '../reaction';
export declare const PARSER_TYPE = "collection";
export declare type SubscribeToken = {
    valGetter: Function;
    type: string;
    table: string;
    initVal: any;
    description?: string;
};
export default class CollectionMiddleware {
    private store;
    static type: string;
    static tokenBuilder(options: any): SubscribeToken | undefined;
    constructor(store: any);
    protected data: {};
    private subscribers;
    private trackedTagsByReaction;
    private reactionVersionTracking;
    private parseSubsToken(token);
    private setTrackedToken(reaction, tag, valGetter, value);
    private getTrackedTokens(reaction, tag);
    subscribe(token: SubscribeToken, reaction: Reaction): () => void;
    dispatch(change: ChangeToken): any[];
    private getTagFromToken(token);
}
