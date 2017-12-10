import * as _ from 'lodash'
// let uuidv4 = require('uuid/v4')
// import uuidv4 from 'uuid/v4'
import * as _uuid from 'uuid'
let uuidv4 = _uuid.v4
export const uuid = () => {
    return _.toUpper(uuidv4())
}
