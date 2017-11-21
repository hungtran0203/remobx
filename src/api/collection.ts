import * as _ from 'lodash'
import * as invariant from 'invariant'

export class Collection {

    constructor(private Model, private items) {}

    public static getInstance(Model, items, options={}) {
        return new Collection(Model, items)
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
     * filters the collection using the given callback, keeping only those items that pass a given truth test
     * @param callback 
     */
    public filter(callback) {
        invariant(typeof callback === 'function', "filter callback argument must be a function")
        const filterIds = this.items.filter((id, index) => {
            return callback(this.Model.getInstance(id), index)
        })
        return Collection.getInstance(this.Model, filterIds)
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

    }

    /**
     * separate elements that pass a given truth test from those that do not
     * @param callback 
     */
    public partition(callback) {

    }

    /**
     * removes and returns the last item from the collection
     */
    public pop() {

    }

    public push() {

    }

    /**
     * removes and returns the first item from the collection
     */
    public shift() {

    }

    public unshift() {

    }

    /**
     * reduces the collection to a single value, passing the result of each iteration into the subsequent iteration
     */
    public reduce() {

    }

    /**
     * searches the collection for the given value and returns its key if found. If the item is not found, false is returned.
     * @param callback 
     */
    public search(callback) {

    }

    /**
     * returns a slice of the collection starting at the given index
     */
    public slice(startIndex, length?) {

    }

    public splice() {

    }

    /**
     * sorts the collection by the given compareFn
     * @param compareFn 
     */
    public sortBy(compareFn, ordering=1) {

    }

    /**
     * return size of the collection
     */
    public size() {
        return this.items.length
    }
}