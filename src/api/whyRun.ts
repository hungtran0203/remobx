import globalState from '../core/globalstate'

export const whyRun = () => {
    if(globalState._updatingReaction) {
        globalState._updatingReaction.whyRun()
    }        
}
