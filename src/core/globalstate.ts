let _reactionStack = []
const globalState = {
    _updatingReaction: undefined,
    _runningReaction: undefined,
    _reactionSet: new WeakMap(),
    _profilingLevel: 0, // 0: disabled profiling
    getReactionContext: () => {
        return globalState._runningReaction || globalState._updatingReaction
    },

    pushReaction: (reaction) => {
        _reactionStack.unshift(reaction)
        globalState._updatingReaction = reaction
    },

    popReaction: () => {
        _reactionStack.shift()
        globalState._updatingReaction = _reactionStack[0]
    },

    isProfilingEnable: (level=0) => {
        return globalState._profilingLevel && globalState._profilingLevel >= level
    },

    setProfilingLevel: (level) => {
        globalState._profilingLevel = level
    }
}

export default globalState