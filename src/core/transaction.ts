import globalState from './globalstate'

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
                globalState.isProfilingEnable() && console.time('transaction')
                this.reactionRunner(this.changes)                
                globalState.isProfilingEnable() && console.timeEnd('transaction')
            }
        }
        finally {
            this.changes = []            
        }
    }
}
