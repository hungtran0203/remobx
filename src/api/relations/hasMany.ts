import * as _ from 'lodash'
import {Field} from '../model'
import {Collection} from '../collection'
import * as invariant from 'invariant'

export const hasMany = (typeFunction, options={}) => {
    return (target, property) => {

        const ownerKey = _.get(options, 'ownerKey', `${property}Ids`)

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
