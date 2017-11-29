import ChangeToken from '../changeToken'
import {ACTIONS} from '../../types/actions'
import {Reaction} from '../reaction'
export const PARSER_TYPE = 'collection'

let _ = require('lodash')
type ParsedToken = {
    tag: string,
    cond: Object,
}

export type SubscribeToken = {
    valGetter: Function,
    type: string,
    table: string,
    initVal: any,
    description?: string,
}

export default class CollectionMiddleware {
    static type = PARSER_TYPE
    static tokenBuilder(options): SubscribeToken | undefined {
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
    private reactionVersionTracking = new WeakMap()

    private parseSubsToken(token): ParsedToken {
        const {type, valGetter, table} = token
        if(type === PARSER_TYPE && table && typeof valGetter === 'function') {
            return {
                tag: this.getTagFromToken(token),
                ...token,
            }
        }
    }

    private setTrackedToken(reaction, tag, valGetter, value) {
        this.getTrackedTokens(reaction, tag).set(valGetter, value)
    }

    private getTrackedTokens(reaction, tag) {
        /**
         * each reaction has a list of token onTracked,
         * the onTracked Token list is wipe out each time reaction version is changed
         */
        const currentVersion = reaction.getVersion()
        const trackedVersion = this.reactionVersionTracking.get(reaction)
        if(currentVersion !== trackedVersion) {
            // update tracked version and wipe out tracked token list of the reaction
            this.reactionVersionTracking.set(reaction, currentVersion)
            this.trackedTagsByReaction.set(reaction, new Map())
        }

        const trackedTagsByReaction = this.trackedTagsByReaction.get(reaction)
        if(!trackedTagsByReaction.has(tag)) {
            trackedTagsByReaction.set(tag, new Map())
        }
        return trackedTagsByReaction.get(tag)
    }

    public subscribe(token: SubscribeToken, reaction: Reaction) {
        let _token: ParsedToken = this.parseSubsToken(token)
        const tag = this.getTagFromToken(token)
        if(_token) {
            if(!this.subscribers.has(tag)) {
                this.subscribers.set(tag, new Set())
            }
            const subscribers = this.subscribers.get(tag)

            subscribers.add(reaction)

            // store prop value at subscribe time
            // use valGetter as track key
            const {valGetter, initVal} = token
            this.setTrackedToken(reaction, tag, valGetter, initVal)

            if(reaction.isTrackEnabled()) {
                console.log(`[trackTrace] tracking`, tag, token.description, initVal)
            }

            return () => {
                subscribers.delete(reaction)
            }    
        }
    }

    public dispatch(change: ChangeToken, scheduler) {
        const tag = this.getTagFromToken(change)
        const reactionSubscribers = this.subscribers.get(tag)
        const rtn = []
        const {action, table, _id} = change as any
        if(reactionSubscribers) {
            reactionSubscribers.forEach(reaction => {
                // fast skip reaction alread scheduled for updating
                if(scheduler.hasReaction(reaction)) return

                switch(action) {
                    case ACTIONS.INSERT:
                    case ACTIONS.DELETE:
                    case ACTIONS.UPDATE:
                        const trackedConditions = this.getTrackedTokens(reaction, tag)
                        // check if value is changed
                        let shouldUpdate = false
                        trackedConditions.forEach((val, valGetter) => {
                            // const newVal = 
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

                                // update track val
                                // token.val = newVal
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

    private getTagFromToken(token) {
        return `${token.table}`
    }
}
