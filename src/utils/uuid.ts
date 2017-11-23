import * as uuidv4_ from 'uuid/v4'
let uuidv4 = (<any>uuidv4_)

import * as _ from 'lodash-es'

export const uuid = () => {
    return _.toUpper(uuidv4())
}
