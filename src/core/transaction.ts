export default class Transaction {
    public stack = []
    public changes = []

    constructor(private reactionRunner) {}

    public queueChanges(changes) {
        this.changes = this.changes.concat(changes)
    }

    public start() {
        this.stack.push(true)
    }

    public end() {
        this.stack.pop()
        if(!this.stack.length) 
            this.reaction()
    }

    public reaction() {
        try {
            if(typeof this.reactionRunner === 'function') {
                this.reactionRunner(this.changes)                
            }
        }
        finally {
            this.changes = []            
        }
    }
}
