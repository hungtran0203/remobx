import * as _ from 'lodash'
import {Collection} from '../collection'
import * as invariant from 'invariant'
import {setDefinition} from '../definition'

export type belongsToManyOptions = {
    foreignKey?: string,
    filter?: object,
    validation?: Function | object,
}

export const belongsToMany = (typeFunction:Function, options:belongsToManyOptions={}) => {
    return (target, property) => {

        const foreignKey = _.get(options, 'foreignKey', `${property}Id`)
        const filter = _.get(options, 'filter', {})

        // set definition for this field
        setDefinition(target.constructor, property, {
            ...options, 
            name: 'belongsToMany', 
            type: belongsToMany,
            ensureData: (data, opt={}) => {
                // const Model = typeFunction()                
                // let val = _.get(data, property)
                delete data[property]
            },
            validation: () => {

            },
        })

        // define relation to property
        Object.defineProperty(target, property, {
            get: function() {
                const Model = typeFunction()
                return Model.find({...filter, [foreignKey]: this.getKey()})
            },
            set: function(items) {
                const Model = typeFunction()
                try {
                    if(Array.isArray(items)) {
                        items = Collection.fromArray(items)
                    }
                    invariant(items.getType() === Model, `belongsToMany relation requires collection of "${Model.name}" while receives collection of "${items.getType().name}"`)
                    return this    
                }
                catch(err) {
                    
                }
            },
            enumerable: true,
            configurable: true
        })

    }
}
