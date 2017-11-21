import globalState from '../core/globalstate'

export const trackTrace = (enable) => {
    if(globalState._runningReaction) {
        globalState._runningReaction.trackTrace(!!enable)
    }
    else if(globalState._updatingReaction) {
        globalState._updatingReaction.trackTrace(!!enable)
    }
}
