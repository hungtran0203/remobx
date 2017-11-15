import * as uuidv4 from 'uuid/v4'
import * as _ from 'lodash'

export const uuid = () => {
    return _.toUpper(uuidv4())
}
