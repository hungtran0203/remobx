import * as _ from 'lodash'
import ReactionScheduler from './reactionScheduler'

export default class FireBase {
    private parsers = []
    constructor(options = {}) {
        const parsersClass = _.get(options, 'tokenParsers')
        if(Array.isArray(parsersClass)) {
            parsersClass.map(Parser => {
                this.parsers.push(new Parser())
            })
        }
    }

    public subscribe(type, token, target) {
        this.parsers.map(parser => {
            parser.subscribe(type, token, target)
        })
    }

    public dispatch(changes) {
        const scheduler = new ReactionScheduler()
        changes = Array.isArray(changes) ? changes : [changes]
        changes.map(change => {
            this.parsers.map(parser => {
                scheduler.add(parser.dispatch(change))
            })    
        })
        scheduler.run()
    }
}