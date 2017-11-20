import {Query} from './query'

export default class Connection {
    static table(tableName): Query {
        return new Query({tableName})
    }
}