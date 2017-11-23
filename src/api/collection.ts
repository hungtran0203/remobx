import * as _ from 'lodash-es'
import * as invariant_ from 'invariant'
let invariant = (<any>invariant_)

export class Collection {

    constructor(private Model, private items, private options={}) {}

    public static getInstance(Model, items, options={}) {
        return new Collection(Model, items, options)
    }

    public static fromArray(models) {
        if(Array.isArray(models)) {
            const Model = _.get(models, '0.constructor')
            const items = models.map(model => {
                invariant(model.constructor === Model, 'Collection::fromArray only accept an array of Models with the same schema')
                return model.getKey()
            })
            return this.getInstance(Model, items)
        }
        return null
    }

    public getType() {
        return this.Model
    }

    /**
     * @returns the underlying array represented by the collection
     */
    public all() {
        return this.items.map(_id => this.Model.getInstance(_id))
    }

    /**
     * breaks the collection into multiple, smaller collections of a given size.
     * @param size 
     */
    public chunk(size) {
        const chunks = _.chunk(this.items, size)
        return chunks.map(chunk => Collection.getInstance(this.Model, chunk, this.options))
    }

    /**
     * determines whether the collection contains a given item
     * @param item 
     */
    public contains(item) {

    }

    /**
     * iterates over the items in the collection and passes each item to a iterator
     * If you would like to stop iterating through the items, you may return false from your callback
     * @param iterator 
     */
    public forEach(iterator) {

    }

    /**
     * Iterates over elements of collection, returning the first element callback returns truthy for. 
     * The callback is invoked with arguments: (value, index|key)
     */
    public find(callback, fromIndex?) {
        return _.find(this.all(), callback, fromIndex)
    }

    /**
     * Iterates over elements of collection from right to left, returning the first element callback returns truthy for. 
     * The callback is invoked with arguments: (value, index|key)
     */
    public findLast(callback, fromIndex?) {
        return _.findLast(this.all(), callback, fromIndex)
    }

    /**
     * filters the collection using the given callback, keeping only those items that pass a given truth test
     * @param callback 
     */
    public filter(callback) {
        invariant(typeof callback === 'function', "filter callback argument must be a function")
        const filterIds = this.items.filter((id, index) => {
            return callback(this.Model.getInstance(id), index)
        })
        return Collection.getInstance(this.Model, filterIds, this.options)
    }

    /**
     * returns the first element in the collection that passes a given truth test
     * You may also call the first method with no arguments to get the first element in the collection
     * @param callback 
     */
    public first(callback) {
        let foundId
        if(typeof callback === 'function') {
            foundId = this.items.find((id, index) => {
                return callback(this.Model.getInstance(id), index)
            })
        }
        else {
            foundId = _.get(this.items, '0')
        }
        
        let rtn = foundId === undefined ? foundId : this.Model.getInstance(foundId)
        return rtn
    }

    /**
     * returns the item at a given path. If the key does not exist, defaultValue || undefined is returned
     * @param path 
     */
    public get(path, defaultValue?) {

    }

    /**
     * determines if a given key exists in the collection
     * @param key 
     */
    public has(key) {

    }

    /**
     * returns true if the collection is empty; otherwise, false is returned
     */
    public isEmpty() {

    }

    /**
     * returns true if the collection is not empty; otherwise, false is returned
     */
    public isNotEmpty() {

    }

    /**
     * returns all of the collection's key
     */
    public keys() {
        return this.items
    }

    /**
     * returns the last element in the collection that passes a given truth test
     * You may also call the last method with no arguments to get the last element in the collection.
     * @param callback 
     */
    public last(callback) {

    }

    /**
     * iterates through the collection and passes each value to the given callback. 
     * The callback is free to modify the item and return it, thus forming a new collection of modified items
     * @param callback 
     */
    public map(callback) {
        invariant(typeof callback === 'function', "map callback argument must be a function")
        return this.items.map((currentValue, currentIndex) => {
            return callback(this.Model.getInstance(currentValue), currentIndex)
        })
    }

    public lists(property) {
        return this.items.map(_id => {
            return _.get(this.Model.getInstance(_id), property)
        })
    }

    /**
     * separate elements that pass a given truth test from those that do not
     * @param callback 
     */
    public partition(callback) {
        const [truthyItems, falsyItems] = _.partition(this.all(), callback)
        return [Collection.fromArray(truthyItems), Collection.fromArray(falsyItems)]
    }

    /**
     * removes and returns the last item from the collection
     */
    public pop() {
        const itemId = this.items.pop()
        if(itemId) {
            this._doChange()
            return this.Model.getInstance(itemId)
        }
    }

    /**
     * add a new item to the end of the collection
     */
    public push(item) {
        const Model = _.get(item, 'constructor')
        invariant(this.Model === Model, `push item must be an instance of ${this.getType().name}`)
        this.items.push(item.getKey())
        this._doChange()
    }

    /**
     * Creates a new collection concatenating the collection with any additional arrays and/or values.
     */
    public concat(...items) {
        const Model = _.get(items, '0.constructor')
        const ids = items.map(item => {
            invariant(item.constructor === Model, `Collection::concat only accept additional item is instance of ${this.getType().name}`)
            return item.getKey()
        })
        return Collection.getInstance(Model, ids)
    }

    /**
     * removes and returns the first item from the collection
     */
    public shift() {
        const itemId = this.items.shift()
        if(itemId) {
            this._doChange()
            return this.Model.getInstance(itemId)
        }
    }

    public unshift(item) {
        const Model = _.get(item, 'constructor')
        invariant(this.Model === Model, `unshift item must be an instance of ${this.getType().name}`)
        this.items.unshift(item.getKey())
        this._doChange()
    }

    /**
     * reduces the collection to a single value, passing the result of each iteration into the subsequent iteration
     */
    public reduce(callback, initialValue) {
        invariant(typeof callback === 'function', "reduce callback argument must be a function")
        return this.items.reduce((accumulator, currentValue, currentIndex) => {
            return callback(accumulator, this.Model.getInstance(currentValue), currentIndex)
        }, initialValue)
    }

    /**
     * return a collection with items in reversed ordering
     */
    public reverse() {
        const reItems = _.reverse([...this.items])
        return Collection.getInstance(this.Model, reItems)
    }

    /**
     * returns a slice of the collection starting at the given index without changing collection
     */
    public slice(startIndex, length?) {
        const sliceItems = this.items.slice(startIndex, length)
        return Collection.getInstance(this.Model, sliceItems, this.options)
    }

    /**
     * changes the contents of a collection by removing existing elements and/or adding new elements
     * @param startIndex 
     * @param deleteCount 
     * @param newItems 
     */
    public splice(startIndex, deleteCount, ...newItems) {
        let newItemIds = []
        if(newItems.length) {
            const Model = _.get(newItems, '0.constructor')
            newItemIds = newItems.map(item => {
                invariant(item.constructor === Model, `splice only accept new item instance of ${this.getType().name}`)
                return item.getKey()
            })
        }
        const deletedItems = this.items.splice(startIndex, deleteCount, ...newItemIds)
        this._doChange()
        return Collection.getInstance(this.Model, deletedItems)
    }

    /**
     * return a collection that is sorted by the given compareFn
     * @param iteratee: The iteratees to sort by
     */
    public sortBy(iteratee) {
        const sortedItems = _.sortBy(this.all(), iteratee)
        return Collection.fromArray(sortedItems)
    }

    /**
     * return a collection that is sorted by the given compareFn
     * @param iteratee: The iteratees to sort by
     */
    public orderBy(iteratee, orders?) {
        const orderedItems = _.orderBy(this.all(), iteratee, orders)
        return Collection.fromArray(orderedItems)
    }

    /**
     * return size of the collection
     */
    public size() {
        return this.items.length
    }

    private _doChange() {
        const onChange = _.get(this.options, 'onChange')
        if(typeof onChange === 'function') {
            onChange(this.items)
        }
    }
}