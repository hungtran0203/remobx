let _ = require('lodash')
import {Column} from '../column'
import {invariant} from '../../utils'
import {setDefinition} from '../definition'
import {transaction, observable, untracked} from 'mobx'

export type hasManyOptions = {
    ownerKey?: string,
    validation?: Function | object
}

export const hasMany = (typeFunction:Function, options:hasManyOptions={}) => (target, property) => {

    const ownerKey = _.get(options, 'ownerKey', `${property}Ids`)

    // set definition for this field
    setDefinition(target.constructor, property, {
        ...options, 
        name: 'hasMany', 
        type: hasMany,
        ensureData: (data, opt={}) => {
            // const Model = typeFunction()                
            // let val = _.get(data, property)
            // if(Array.isArray(val)) {
            //     val = val.map(item => {
            //         // check for item exist
            //         return Model.findOrNew(item)
            //     })
            //     val = Collection.fromArray(val)
            // }
            // if(val && val instanceof Collection && val.getType() === Model) {
            //     _.set(data, ownerKey, val.keys())
            // }
            // delete data[property]
        },
        validation: () => {

        },
    })

    const getIdsFromItems = (items) => {
        const ids = []
        const Model = typeFunction()
        untracked(() => {
            items.map(item => {
                const instance = item instanceof Model ? item : Model.findById(item)
                invariant(instance, `invalid or not found instance for hasMany relation "${property}"`)
                ids.push(instance.getKey())
            })    
        })
        return ids
    }
    // const _cachedRelations = new WeakMap()
    // define relation to property
    Object.defineProperty(target, property, {
        get: function() {
            // if(!_cachedRelations.has(this)) {
                const Model = typeFunction()
                const ids = this[ownerKey] || []
                let relations = ids.map(id => Model.findById(id))
                relations = observable(relations)
    
                const disposer1 = relations.intercept((change) => {
                    const {added} = change as any
                    // check for insert item must be valid
                    if(added.length) {
                        // verify added items are valid
                        try {
                            getIdsFromItems(added)
                        }
                        catch(err) {
                            console.log(err)
                            return null
                        }
                    }
                    return change
                })
                const disposer2 = relations.observe((change) => {
                    const ids = getIdsFromItems(change.object)
                    if(!_.isEqual(ids, this[ownerKey])) {
                        this[ownerKey] = ids
                    }
                })
    
                // cleanup on unobserved
                // const _onBecomeUnobserved = relations.onBecomeUnobserved.bind(relations)
                // relations.onBecomeUnobserved = () => {
                //     _onBecomeUnobserved()
    
                //     // dispose listener on add/remove instance
                //     disposer1()
                //     disposer2()
                // }
    
                // _cachedRelations.set(this, relations)
                return relations
            // }
            // return _cachedRelations.get(this)
        },
        set: function(items) {
            transaction(() => {
                const ids = getIdsFromItems(items)
                if(!_.isEqual(ids, this[ownerKey])) {
                    this[ownerKey] = ids
                }
            })
        },
        enumerable: true,
        configurable: true
    })

    // define ownerKey property
    Column()(target, ownerKey)
}
