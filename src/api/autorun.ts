import globalState from '../core/globalstate'
import {Reaction} from '../core/reaction'

const _autoRunStack = []
export const autorun = (reactionRunner) => {
    let disposer
    try {
        if(globalState._runningReaction) {
            _autoRunStack.unshift(globalState._runningReaction)
        }
        // rerun reactionRunner case
        if(globalState._reactionSet.has(reactionRunner)) {
            globalState._runningReaction = globalState._reactionSet.get(reactionRunner)
            disposer = globalState._runningReaction.dispose
            globalState._runningReaction.update()
        }
        else {
            // first time init reactionRunner case
            globalState._reactionSet.set(reactionRunner, new Reaction(reactionRunner))
            globalState._runningReaction = globalState._reactionSet.get(reactionRunner)
            disposer = globalState._runningReaction.dispose
            globalState._runningReaction.run()
        }
        
    }
    finally {
        globalState._runningReaction = _autoRunStack.shift()
    }
    return disposer
}
