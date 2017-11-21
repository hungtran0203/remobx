import * as _ from 'lodash'
import {Field} from '../model'

export const hasOne = (typeFunction, options={}) => {
    return (target, property) => {

        const ownerKey = _.get(options, 'ownerKey', `${property}Id`)

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
