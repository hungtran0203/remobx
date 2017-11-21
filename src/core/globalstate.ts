const globalState = {
    _updatingReaction: undefined,
    _runningReaction: undefined,
    _reactionSet: new WeakMap(),
    getReactionContext: () => {
        return globalState._runningReaction || globalState._updatingReaction
    },
}

export default globalState