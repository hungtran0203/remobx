let _ = require('lodash')
import ReactionScheduler from './reactionScheduler'
import globalState from './globalstate'

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
        globalState.isProfilingEnable() && console.time('change processing')
        changes.map(change => {
            globalState.isProfilingEnable(2) && console.time(`change token ${change._id}`)
            this.middlewares.map(parser => {
                scheduler.add(parser.dispatch(change, scheduler))
            })    
            globalState.isProfilingEnable(2) && console.timeEnd(`change token ${change._id}`)
        })
        globalState.isProfilingEnable() && console.timeEnd('change processing')
        scheduler.run()
    }
}