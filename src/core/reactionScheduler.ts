import {Reaction} from './reaction'

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
        this.reactions.forEach(r => {
            if(typeof r === 'function') {
                r()
            }
            else if(r instanceof Reaction) {
                r.update()
            }
        })
    }
}