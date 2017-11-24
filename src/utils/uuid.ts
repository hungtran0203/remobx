
let uuidv4 = require('uuid/v4')

let _ = require('lodash')

export const uuid = () => {
    return _.toUpper(uuidv4())
}
