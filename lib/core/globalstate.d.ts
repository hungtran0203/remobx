declare const globalState: {
    _updatingReaction: any;
    _runningReaction: any;
    _reactionSet: WeakMap<object, any>;
    getReactionContext: () => any;
};
export default globalState;
