declare const globalState: {
    _updatingReaction: any;
    _runningReaction: any;
    _reactionSet: WeakMap<object, any>;
    _profilingLevel: number;
    getReactionContext: () => any;
    pushReaction: (reaction: any) => void;
    popReaction: () => void;
    isProfilingEnable: (level?: number) => boolean;
    setProfilingLevel: (level: any) => void;
};
export default globalState;
