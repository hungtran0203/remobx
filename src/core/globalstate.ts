const globalState = {
    _updatingReaction: undefined,
    _runningReaction: undefined,
    _reactionSet: new WeakMap(),
}

export default globalState