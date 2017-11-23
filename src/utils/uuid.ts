
// import * as uuidv4_ from 'uuid/v4'
// let uuidv4 = (<any>uuidv4_)
let uuidv4 = require('uuid/v4')

import * as _ from 'lodash-es'

export const uuid = () => {
    return _.toUpper(uuidv4())
}
