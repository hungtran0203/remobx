import * as _ from 'lodash'
import {Field} from '../field'
import {Collection} from '../collection'
import * as invariant from 'invariant'
import {setDefinition} from '../definition'

export type hasManyOptions = {
    ownerKey?: string,
    validation?: Function | object
}

export const hasMany = (typeFunction:Function, options:hasManyOptions={}) => {
    return (target, property) => {

        const ownerKey = _.get(options, 'ownerKey', `${property}Ids`)

        // set definition for this field
        setDefinition(target.constructor, property, {
            ...options, 
            name: 'hasMany', 
            type: hasMany,
            ensureData: (data, opt={}) => {
                const Model = typeFunction()                
                let val = _.get(data, property)
                if(Array.isArray(val)) {
                    val = Collection.fromArray(val)
                }
                if(val.getType() === Model) {
                    _.set(data, ownerKey, val.keys())
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
                let itemIds = this.get(ownerKey)
                if(!Array.isArray(itemIds)) {
                    itemIds = []
                }

                return Model.find({[Model.getKeyName()]: {$in: itemIds}}, {onChange: (items) => {
                    this[ownerKey] = items
                }})
            },
            set: function(items) {
                const Model = typeFunction()
                try {
                    const col = Collection.fromArray(items)
                    invariant(col.getType() === Model, `hasMany relation requires collection of "${Model.name}" while receives collection of "${col.getType().name}"`)
                    this[ownerKey] = col.keys()
                    return this    
                }
                catch(err) {
                    
                }
            },
            enumerable: true,
            configurable: true
        })

        // define ownerKey property
        Field(options)(target, ownerKey)
    }
}
