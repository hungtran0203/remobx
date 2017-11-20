import globalState from '../core/globalstate'
import {Reaction} from '../core/reaction'

export const autorun = (reactionRunner) => {
    let disposer
    try {
        if(globalState._reactionSet.has(reactionRunner)) {
            globalState._runningReaction = globalState._reactionSet.get(reactionRunner)
            disposer = globalState._runningReaction.dispose
            globalState._runningReaction.update()
        }
        else {
            globalState._reactionSet.set(reactionRunner, new Reaction(reactionRunner))
            globalState._runningReaction = globalState._reactionSet.get(reactionRunner)
            disposer = globalState._runningReaction.dispose
            globalState._runningReaction.run()
        }
        
    }
    finally {
        globalState._runningReaction = undefined
    }
    return disposer
}
