import * as _ from 'lodash'
import {Field} from '../model'
import {setDefinition} from '../definition'

export const hasOne = (typeFunction, options={}) => {
    return (target, property) => {
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
                const itemId = this.get(ownerKey)
                return Model.findById(itemId)
            },
            set: function(newVal) {
                const Model = typeFunction()
                const relationInstance = newVal instanceof Model ? newVal : Model.findById(newVal)
                this[ownerKey] = relationInstance ? relationInstance.getKey() : undefined
                return this
            },
            enumerable: true,
            configurable: true
        })

        // define ownerKey property
        Field(options)(target, ownerKey)
    }
}
