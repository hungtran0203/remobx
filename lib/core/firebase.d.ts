export default class FireBase {
    private store;
    private middlewares;
    constructor(options: {}, store: any);
    subscribe(token: any, target: any): () => void;
    dispatch(changes: any): void;
}
