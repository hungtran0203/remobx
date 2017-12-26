import {invariant} from '../utils'

import {setDefinition} from './definition'
import {observable, extendObservable} from 'mobx'

import * as _ from 'lodash'

export type FieldOptions = {
    validation?: Function | object,
    defaultValue?: any,
    isRequired?: string | boolean
}

export const Column = (options:FieldOptions={}) => (target, property) => {
    const defaultValue = _.get(options, 'defaultValue')
    const isRequired = _.get(options, 'required')
    // set definition for this field
    setDefinition(target.constructor, property, {
        ...options, 
        name: 'Column', 
        type: Column,
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

    extendObservable(target, {[property]: defaultValue})
}
