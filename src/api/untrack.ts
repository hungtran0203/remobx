import globalState from '../core/globalstate'
export const untrack = (fn) => {
    let _runningReaction, _updatingReaction
    try {
        if(typeof fn === 'function') {
            _runningReaction = globalState._runningReaction
            _updatingReaction = globalState._updatingReaction
            globalState._runningReaction = undefined
            globalState._updatingReaction = undefined
            fn()
        }        
    }
    finally {
        // restore the reaction scope on finish untrackScope
        globalState._runningReaction = _runningReaction
        globalState._updatingReaction = _updatingReaction
    }
}
