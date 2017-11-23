export declare class Collection {
    private Model;
    private items;
    private options;
    constructor(Model: any, items: any, options?: {});
    static getInstance(Model: any, items: any, options?: {}): Collection;
    static fromArray(models: any): Collection;
    getType(): any;
    /**
     * @returns the underlying array represented by the collection
     */
    all(): any;
    /**
     * breaks the collection into multiple, smaller collections of a given size.
     * @param size
     */
    chunk(size: any): any;
    /**
     * determines whether the collection contains a given item
     * @param item
     */
    contains(item: any): void;
    /**
     * iterates over the items in the collection and passes each item to a iterator
     * If you would like to stop iterating through the items, you may return false from your callback
     * @param iterator
     */
    forEach(iterator: any): void;
    /**
     * Iterates over elements of collection, returning the first element callback returns truthy for.
     * The callback is invoked with arguments: (value, index|key)
     */
    find(callback: any, fromIndex?: any): any;
    /**
     * Iterates over elements of collection from right to left, returning the first element callback returns truthy for.
     * The callback is invoked with arguments: (value, index|key)
     */
    findLast(callback: any, fromIndex?: any): any;
    /**
     * filters the collection using the given callback, keeping only those items that pass a given truth test
     * @param callback
     */
    filter(callback: any): Collection;
    /**
     * returns the first element in the collection that passes a given truth test
     * You may also call the first method with no arguments to get the first element in the collection
     * @param callback
     */
    first(callback: any): any;
    /**
     * returns the item at a given path. If the key does not exist, defaultValue || undefined is returned
     * @param path
     */
    get(path: any, defaultValue?: any): void;
    /**
     * determines if a given key exists in the collection
     * @param key
     */
    has(key: any): void;
    /**
     * returns true if the collection is empty; otherwise, false is returned
     */
    isEmpty(): void;
    /**
     * returns true if the collection is not empty; otherwise, false is returned
     */
    isNotEmpty(): void;
    /**
     * returns all of the collection's key
     */
    keys(): any;
    /**
     * returns the last element in the collection that passes a given truth test
     * You may also call the last method with no arguments to get the last element in the collection.
     * @param callback
     */
    last(callback: any): void;
    /**
     * iterates through the collection and passes each value to the given callback.
     * The callback is free to modify the item and return it, thus forming a new collection of modified items
     * @param callback
     */
    map(callback: any): any;
    lists(property: any): any;
    /**
     * separate elements that pass a given truth test from those that do not
     * @param callback
     */
    partition(callback: any): Collection[];
    /**
     * removes and returns the last item from the collection
     */
    pop(): any;
    /**
     * add a new item to the end of the collection
     */
    push(item: any): void;
    /**
     * Creates a new collection concatenating the collection with any additional arrays and/or values.
     */
    concat(...items: any[]): Collection;
    /**
     * removes and returns the first item from the collection
     */
    shift(): any;
    unshift(item: any): void;
    /**
     * reduces the collection to a single value, passing the result of each iteration into the subsequent iteration
     */
    reduce(callback: any, initialValue: any): any;
    /**
     * return a collection with items in reversed ordering
     */
    reverse(): Collection;
    /**
     * returns a slice of the collection starting at the given index without changing collection
     */
    slice(startIndex: any, length?: any): Collection;
    /**
     * changes the contents of a collection by removing existing elements and/or adding new elements
     * @param startIndex
     * @param deleteCount
     * @param newItems
     */
    splice(startIndex: any, deleteCount: any, ...newItems: any[]): Collection;
    /**
     * return a collection that is sorted by the given compareFn
     * @param iteratee: The iteratees to sort by
     */
    sortBy(iteratee: any): Collection;
    /**
     * return a collection that is sorted by the given compareFn
     * @param iteratee: The iteratees to sort by
     */
    orderBy(iteratee: any, orders?: any): Collection;
    /**
     * return size of the collection
     */
    size(): any;
    private _doChange();
}
