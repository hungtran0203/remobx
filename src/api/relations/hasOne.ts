let _ = require('lodash')
import {Column} from '../column'
import {setDefinition} from '../definition'
import {untracked, observable} from 'mobx'

export type hasOneOptions = {
    ownerKey?: string,
    validation?: Function | object
}

export const hasOne = (typeFunction:Function, options:hasOneOptions={}) => (target, property) => {
    const ownerKey = _.get(options, 'ownerKey', `${property}Id`)
    
    // set definition for this field
    setDefinition(target.constructor, property, {
        ...options, 
        name: 'hasOne', 
        type: hasOne,
        ensureData: (data, opt={}) => {
            const Model = typeFunction()                
            let val = _.get(data, property)
            if(val instanceof Model) {
                _.set(data, ownerKey, val.getKey())
            }
            delete data[property]
        },
        validation: () => {

        },
    })

    // define relation to property
    Object.defineProperty(target, property, {
        get: function() {
            const Model = typeFunction()
            const itemId = this[ownerKey]
            
            return itemId ? Model.findById(itemId) : undefined
        },
        set: function(newVal) {
            untracked(() => {
                const Model = typeFunction()
                const relationInstance = newVal instanceof Model ? newVal : Model.findById(newVal)
                this[ownerKey] = relationInstance ? relationInstance.getKey() : undefined    
            })
            return this
        },
        enumerable: true,
        configurable: true
    })

    // define ownerKey property
    Column(options)(target, ownerKey)
}
