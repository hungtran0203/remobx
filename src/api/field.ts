import {getStore} from '../core/store'
import ModelMiddleware from '../core/middlewares/model'
import {invariant} from '../utils'

import {setDefinition} from './definition'
import globalState from '../core/globalstate'
import * as _ from 'lodash-es'

export type FieldOptions = {
    validation?: Function | object,
    defaultValue?: any,
    isRequired?: string | boolean
}

export const Field = (options:FieldOptions={}) => (target, property) => {
    const defaultValue = _.get(options, 'defaultValue')
    const isRequired = _.get(options, 'required')
    // set definition for this field
    setDefinition(target.constructor, property, {
        ...options, 
        name: 'Field', 
        type: Field,
        ensureData: (data, opt={}) => {
            let val = _.get(data, property, defaultValue)
            val = typeof val === 'function' ? val() : val
            // check required
            invariant(!(isRequired && val === undefined), `Missing value for required field ${property}`)
            _.set(data, property, val)
        },
        validation: () => {
        },
    })

    Object.defineProperty(target, property, {
        get: function() {
            // setup property tracking if needed
            const store = getStore()
            const reactionContext = globalState.getReactionContext()
            if(reactionContext) {
                const token = ModelMiddleware.tokenBuilder(this.getTableName(), this.getKey(), property)
                reactionContext.track(token)
            }
            const propVal = store.get(this.getTableName(), this._id, property, defaultValue)
            return propVal
        },
        set: function(newVal) {
            // @TODO: perform data validation for field

            this.update({[property]: {$set: newVal}})
            return newVal
        },
        enumerable: true,
        configurable: true
    })
}
