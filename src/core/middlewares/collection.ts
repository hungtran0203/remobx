import ChangeToken from '../changeToken'
import * as _ from 'lodash-es'
import {ACTIONS} from '../../types/actions'
export const PARSER_TYPE = 'collection'

type ParsedToken = {
    tag: string,
    cond: Object,
}
export default class CollectionMiddleware {
    static type = PARSER_TYPE
    static tokenBuilder(options) {
        const {table} = options
        if(table) {
            return {
                type: PARSER_TYPE,
                ...options,
            }    
        }
    }

    constructor(private store) {}
    
    protected data = {}
    private subscribers = new Map()
    private trackedTagsByReaction = new WeakMap()

    private parseSubsToken(token): ParsedToken {
        const {type, valGetter, table} = token
        if(type === PARSER_TYPE && table && typeof valGetter === 'function') {
            return {
                tag: this.serializeToken(token),
                ...token,
            }
        }
    }

    private setTrackedToken(reaction, tag, cond, token) {
        this.getTrackedTokens(reaction, tag).set(cond, token)
    }

    private getTrackedTokens(reaction, tag) {
        if(!this.trackedTagsByReaction.has(reaction)) {
            this.trackedTagsByReaction.set(reaction, new Map())
        }
        const trackedTagsByReaction = this.trackedTagsByReaction.get(reaction)
        if(!trackedTagsByReaction.has(tag)) {
            trackedTagsByReaction.set(tag, new Map())
        }
        return trackedTagsByReaction.get(tag)
    }

    public subscribe(token, reaction) {
        let _token: ParsedToken = this.parseSubsToken(token)
        if(_token) {
            if(!this.subscribers.has(_token.tag)) {
                this.subscribers.set(_token.tag, new Set())
            }
            const tokenSubscribers = this.subscribers.get(_token.tag)

            tokenSubscribers.add(reaction)

            // store prop value at subscribe time
            const {cond} = token
            this.setTrackedToken(reaction, _token.tag, cond, _token)

            if(reaction.isTrackEnabled()) {
                console.log(`[trackTrace] tracking`, _token.tag, cond)
            }

            return () => {
                tokenSubscribers.delete(reaction)
            }    
        }
    }

    public dispatch(change: ChangeToken) {
        const tag = this.serializeToken(change)
        const reactionSubscribers = this.subscribers.get(tag)
        const rtn = []
        const {action, table, _id} = change as any
        if(reactionSubscribers) {
            reactionSubscribers.forEach(reaction => {
                switch(action) {
                    case ACTIONS.INSERT:
                    case ACTIONS.DELETE:
                    case ACTIONS.UPDATE:
                        const trackedConditions = this.getTrackedTokens(reaction, tag)
                        // check if value is changed
                        let shouldUpdate = false
                        trackedConditions.forEach((token, cond) => {
                            // const newVal = 
                            const {val, valGetter} = token
                            const newVal = valGetter()
                            if(!_.isEqual(val, newVal)) {
                                reaction.addRunReason({
                                    target: {
                                        table,
                                        _id,
                                    },
                                    oldVal: val,
                                    newVal,
                                    reason: 'collection update'
                                })
                                shouldUpdate = true
                            }
                        })
                        if(shouldUpdate) {
                            rtn.push(reaction)
                        }
                        break;    
                }
            })
        }
        return rtn
    }

    private serializeToken(token) {
        return `${token.table}`
    }
}
