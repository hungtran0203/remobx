import {Reaction} from './reaction'
import globalState from './globalstate'

export default class ReactionScheduler {
    private reactions = new Set()
    public add(reaction) {
        if(Array.isArray(reaction)) {
            reaction.map(r => this.add(r))
        }
        else {
            this.reactions.add(reaction)
        }
    }
    public run() {
        globalState.isProfilingEnable() && console.time(`perform ${this.reactions.size} reactions in`)
        this.reactions.forEach(r => {
            if(typeof r === 'function') {
                r()
            }
            else if(r instanceof Reaction) {
                r.update()
            }
        })
        globalState.isProfilingEnable() && console.timeEnd(`perform ${this.reactions.size} reactions in`)
    }

    public hasReaction(reaction) {
        return this.reactions.has(reaction)
    }
}