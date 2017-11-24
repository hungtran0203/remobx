let _ = require('lodash')
import ReactionScheduler from './reactionScheduler'

export default class FireBase {
    private middlewares = []
    constructor(options = {}, private store) {
        const middlewares = _.get(options, 'middlewares')
        if(Array.isArray(middlewares)) {
            middlewares.map(Middleware => {
                this.middlewares.push(new Middleware(this.store))
            })
        }
    }

    public subscribe(token, target) {
        const disposers = []
        this.middlewares.map(parser => {
            const disposer = parser.subscribe(token, target)
            if(typeof disposer === 'function') {
                disposers.push(disposer)
            }
        })
        return () => {
            disposers.map(d => d())
        }
    }

    public dispatch(changes) {
        const scheduler = new ReactionScheduler()
        changes = Array.isArray(changes) ? changes : [changes]
        changes.map(change => {
            this.middlewares.map(parser => {
                scheduler.add(parser.dispatch(change))
            })    
        })
        scheduler.run()
    }
}