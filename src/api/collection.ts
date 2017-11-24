let _ = require('lodash')
import {invariant} from '../utils'
import globalState from '../core/globalstate'
import CollectionMiddleware from '../core/middlewares/collection'

/*
    collection is an ordered of similiar model instances
*/

export type CollectionOptions = {
    resolver?: Function,
    items?: any[],
    onChange?: Function,
}

export class Collection {
    private get items() {
        const getter = _.get(this.options, 'resolver')
        if(typeof getter === 'function') {
            let items = getter()

            // access to all will trigger collection tracking
            this._track(items)
            return items
        }
        return _.get(this.options, 'items', [])
    }

    constructor(private Model, private options:CollectionOptions={}) {}

    public static getInstance(Model, options:CollectionOptions={}) {
        return new Collection(Model, options)
    }

    public static fromArray(models) {
        if(Array.isArray(models)) {
            const Model = _.get(models, '0.constructor')
            const items = models.map(model => {
                invariant(model.constructor === Model, 'Collection::fromArray only accept an array of Models with the same schema')
                return model.getKey()
            })

            // init collection from array does not have resolver so it will not be able to track
            return this.getInstance(Model, {items})
        }
        return null
    }

    public getType() {
        return this.Model
    }

    private _track(items) {
        const reactionContext = globalState.getReactionContext()
        let valGetter = _.get(this.options, 'resolver')
        if(reactionContext && valGetter) {
            const token = CollectionMiddleware.tokenBuilder({initVal: items, valGetter, table: this.Model.getTableName()})
            reactionContext.track(token)
        }
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
        return chunks.map(chunk => Collection.getInstance(this.Model, {...this.options, items: chunk}))
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
    public filter(predicate) {
        const orderedItems = _.filter(this.all(), predicate)
        return Collection.fromArray(orderedItems)        
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
        return _.get(this.all(), path, defaultValue)
    }

    /**
     * determines if a given key exists in the collection
     * @param key 
     */
    public has(key) {
        return this.items.indexOf(key) >= 0 
    }

    /**
     * returns true if the collection is empty; otherwise, false is returned
     */
    public isEmpty() {
        return !this.items.length
    }

    /**
     * returns true if the collection is not empty; otherwise, false is returned
     */
    public isNotEmpty() {
        return !!this.items.length
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
     * return new collection without the last item compares to the collection
     */
    public pop() {
        if(this.size()) {
            const items = this.items.slice(0, this.items.length - 1)
            this._doChange(items)
            return Collection.getInstance(this.Model, {items})
        }
    }

    /**
     * return new collection with the additional item at the end
     */
    public push(item) {
        const Model = _.get(item, 'constructor')
        invariant(this.Model === Model, `push item must be an instance of ${this.getType().name}`)
        const items = this.items.concat(item.getKey())
        this._doChange(items)
        return Collection.getInstance(Model, {items})
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
        return Collection.getInstance(Model, {items: ids})
    }

    /**
     * removes and returns the first item from the collection
     */
    public shift() {
        if(this.size()) {
            const items = this.items.slice(1)
            this._doChange(items)
            return Collection.getInstance(this.Model, {items})
        }
    }

    public unshift(item) {
        const Model = _.get(item, 'constructor')
        invariant(this.Model === Model, `unshift item must be an instance of ${this.getType().name}`)
        const items = [item.getKeys()].concat(this.items)
        this._doChange(items)
        return Collection.getInstance(Model, {items})
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
        return Collection.getInstance(this.Model, {...this.options, items: sliceItems})
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
        this._doChange(deletedItems)
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

    private _doChange(items) {
        const onChange = _.get(this.options, 'onChange')
        if(typeof onChange === 'function') {
            onChange(items)
        }
    }
}