export default class ReactionScheduler {
    private reactions = []
    public add(reaction) {
        if(Array.isArray(reaction)) {
            reaction.map(r => this.add(r))
        }
        else {
            this.reactions.push(reaction)
        }
    }
    public run() {
        this.reactions.map(r => r())
    }
}