import * as _ from 'lodash'
import {Collection} from '../collection'
import * as invariant from 'invariant'

export const belongsToMany = (typeFunction, options={}) => {
    return (target, property) => {

        const foreignKey = _.get(options, 'foreignKey', `${property}Id`)

        // define relation to property
        Object.defineProperty(target, property, {
            get: function() {
                const Model = typeFunction()
                return Model.find({[foreignKey]: this.getKey()})
            },
            set: function(items) {
                // const Model = typeFunction()
                // try {
                //     const col = Collection.fromArray(items)
                //     invariant(col.getType() === Model, `hasMany relation requires collection of "${Model.name}" while receives collection of "${col.getType().name}"`)
                //     this[ownerKey] = col.keys()
                //     return this    
                // }
                // catch(err) {
                    
                // }
            },
            enumerable: true,
            configurable: true
        })

    }
}
