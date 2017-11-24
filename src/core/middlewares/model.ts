import ChangeToken from '../changeToken'
let _ = require('lodash')
import {ACTIONS} from '../../types/actions'

export const PARSER_TYPE = 'model'

type ParsedToken = {
    tag: string,
    prop: string,
}
export default class ModelMiddleware {
    static type = PARSER_TYPE
    static tokenBuilder(tableName, _id, prop) {
        return {
            type: PARSER_TYPE,
            table: tableName,
            _id,
            prop
        }
    }

    constructor(private store) {}
    
    protected data = {}
    private subscribers = new Map()
    private trackedTagsByReaction = new WeakMap()

    private parseSubsToken(token): ParsedToken {
        const {type, prop} = token
        if(type === PARSER_TYPE) {
            return {
                tag: this.serializeToken(token),
                prop,
            }
        }
    }

    private setTrackedPropVal(reaction, tag, prop, val) {
        this.getTrackedProps(reaction, tag).set(prop, val)
    }

    private getTrackedProps(reaction, tag) {
        if(!this.trackedTagsByReaction.has(reaction)) {
            this.trackedTagsByReaction.set(reaction, new Map())
        }
        const trackedTagsByReaction = this.trackedTagsByReaction.get(reaction)
        if(!trackedTagsByReaction.has(tag)) {
            trackedTagsByReaction.set(tag, new Map())
        }
        return trackedTagsByReaction
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
            const {prop, table, _id} = token
            this.setTrackedPropVal(reaction, _token.tag, prop, this.store.get(table, _id, prop))

            if(reaction.isTrackEnabled()) {
                console.log(`[trackTrace] tracking`, _token.tag, prop)
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
        const {table, _id, action} = change as any
        if(reactionSubscribers) {
            reactionSubscribers.forEach(reaction => {
                switch(action) {
                    case ACTIONS.INSERT:
                    case ACTIONS.DELETE:
                        rtn.push(reaction)
                        break;
                    case ACTIONS.UPDATE:
                        const trackedProps = this.getTrackedProps(reaction, tag)
                        // check if value is changed
                        let shouldUpdate = false
                        trackedProps.forEach((value, prop) => {
                            const newVal = this.store.get(table, _id, prop)
                            if(!_.isEqual(value, newVal)) {
                                // update run reason
                                reaction.addRunReason({
                                    target: {
                                        table,
                                        _id,
                                        prop,
                                    },
                                    oldVal: value,
                                    newVal
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
        return `${token.table}::${token._id}`
    }
}
