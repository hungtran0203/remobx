/** ReMobx - (c) Hung Tran 2017 - MIT Licensed */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('reflect-metadata');
var mobx = require('mobx');
var _ = require('lodash');
var _uuid = require('uuid');

var metaKey = 'relations:spec';
var setDefinition = function (target, property, relation) {
    if (!Reflect.hasMetadata(metaKey, target)) {
        Reflect.metadata(metaKey, new Map())(target);
    }
    Reflect.getMetadata(metaKey, target).set(property, relation);
};
var getDefinition = function (target, property) {
    if (Reflect.hasMetadata(metaKey, target)) {
        return Reflect.getMetadata(metaKey, target).get(property);
    }
};
var listDefinitions = function (target) {
    if (Reflect.hasMetadata(metaKey, target)) {
        return Reflect.getMetadata(metaKey, target);
    }
};
var _tableKeys = new Map();
var setEntityKey = function (table, keyName) {
    _tableKeys.set(table, keyName);
};
var getEntityKey = function (table) {
    return _tableKeys.get(table);
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */



var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};



function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function invariant(check, message, thing) {
    if (!check)
        throw new Error("[remobx] Invariant failed: " + message + (thing ? " in '" + thing + "'" : ""));
}

var Column = function (options) {
    if (options === void 0) { options = {}; }
    return function (target, property) {
        var defaultValue = _.get(options, 'defaultValue');
        var isRequired = _.get(options, 'required');
        // set definition for this field
        setDefinition(target.constructor, property, __assign({}, options, { name: 'Column', type: Column, ensureData: function (data, opt) {
                if (opt === void 0) { opt = {}; }
                var val = _.get(data, property, defaultValue);
                val = typeof val === 'function' ? val() : val;
                // check required
                invariant(!(isRequired && val === undefined), "Missing value for required field " + property);
                _.set(data, property, val);
            }, validation: function () {
            } }));
        mobx.extendObservable(target, (_a = {}, _a[property] = defaultValue, _a));
        var _a;
    };
};

// let uuidv4 = require('uuid/v4')
// import uuidv4 from 'uuid/v4'
var uuidv4 = _uuid.v4;
var uuid = function () {
    return _.toUpper(uuidv4());
};

var DataStore = /** @class */ (function () {
    function DataStore() {
        var _this = this;
        this.instances = [];
        this.meta = {};
        this.indexes = {
            byIds: {},
        };
        this.computes = new Map();
        mobx.observe(this.instances, function (change) {
            // console.log('chachc', change)
            var _a = change, added = _a.added, removed = _a.removed;
            added.map(function (instance) {
                var id = instance.getKey();
                if (_this.indexes.byIds.hasOwnProperty(id)) {
                    _this.indexes.byIds[id] = instance;
                }
            });
            removed.map(function (instance) {
                var id = instance.getKey();
                if (_this.indexes.byIds.hasOwnProperty(id)) {
                    _this.indexes.byIds[id] = undefined;
                }
            });
        });
    }
    __decorate([
        mobx.observable
    ], DataStore.prototype, "instances", void 0);
    __decorate([
        mobx.observable
    ], DataStore.prototype, "meta", void 0);
    __decorate([
        mobx.observable
    ], DataStore.prototype, "indexes", void 0);
    __decorate([
        mobx.observable
    ], DataStore.prototype, "computes", void 0);
    return DataStore;
}());
var registerEntity = function (target, options) {
    var _a = options, tableName = _a.tableName, _b = _a.keyName, keyName = _b === void 0 ? '_id' : _b;
    var Model = target;
    Model.tableName = tableName;
    Model.keyName = keyName;
    setEntityKey(tableName, keyName);
    /********** static methods **********/
    Model.getKeyName = function () {
        return keyName;
    };
    Model.getEntityName = function () {
        return tableName;
    };
    /********** prototype methods **********/
    Model.prototype.getKeyName = function () {
        return keyName;
    };
    Model.prototype.getEntityName = function () {
        return tableName;
    };
};
var Entity = function (options) {
    return function (target) {
        registerEntity(target, options);
    };
};
var Model = /** @class */ (function () {
    function Model(data) {
        var _sanitizedData = data;
        Object.assign(this, (_a = {}, _a[this.getKeyName()] = uuid(), _a), _sanitizedData);
        var _a;
    }
    Model.delete = function (instance) {
        return this._store.instances['remove'].apply(this._store.instances, [instance]);
    };
    Model.prototype.getKey = function () {
        return this[this.getKeyName()];
    };
    Model.prototype.update = function (data) {
    };
    Model.prototype.delete = function () {
        var Model = this.constructor;
        Model['delete'].apply(Model, [this]);
    };
    Model.prototype.get = function (path, defaultValue) {
    };
    Model.prototype.getHashKey = function (prop) {
    };
    Model._store = new DataStore();
    Model._cacheModelInstances = new Map();
    Model.getInstance = function (_id) {
    };
    Model.new = function (data) {
        return this.insert(data);
    };
    Model.insert = function (data, opt) {
        var Model = this;
        var instance = new Model(data);
        this._store.instances.push(instance);
        return instance;
    };
    Model.findOrNew = function (data, opt) {
        var _this = this;
        mobx.untracked(function () {
            var rtn = _this.findOne(data);
            if (!rtn) {
                return _this.insert(data, opt);
            }
        });
        return this.findOne(data);
    };
    Model.findById = function (_id) {
        var _this = this;
        if (this._store.indexes.byIds.hasOwnProperty(_id)) {
            return this._store.indexes.byIds[_id];
        }
        else {
            mobx.untracked(function () {
                var instance = _this._store.instances.find(function (instance) { return instance[_this.getKeyName()] === _id; });
                mobx.extendObservable(_this._store.indexes.byIds, (_a = {}, _a[_id] = mobx.observable.ref(instance), _a));
                var _a;
            });
            return this._store.indexes.byIds[_id];
        }
    };
    Model.findOne = function (cond) {
        return this.find(cond)[0];
    };
    Model.find = function (cond, options) {
        //TODO: serialize cond to a hash string 
        var _this = this;
        if (options === void 0) { options = {}; }
        var condHash = JSON.stringify(cond);
        if (this._store.computes.has(condHash)) {
            return this._store.computes.get(condHash).get();
        }
        else {
            var genComputor_1 = _.memoize(function (instance) {
                return mobx.computed(function () {
                    var isMatched = _.isMatch(instance, cond);
                    return { isMatched: isMatched, instance: instance };
                }, { equals: function (a, b) { return a.isMatched === b.isMatched; } });
            });
            // check for new inserted item
            var computedVal_1;
            mobx.untracked(function () {
                // gen computor for current instances
                var len;
                var instances = [];
                len = _this._store.instances.length;
                for (var i = 0; i < len; i++) {
                    instances[i] = genComputor_1(_this._store.instances[i]);
                }
                var computes = mobx.observable(instances);
                var disposer = mobx.observe(_this._store.instances, function (change) {
                    var _a = change, added = _a.added, removed = _a.removed;
                    added.map(function (instance) {
                        computes.push(genComputor_1(instance));
                    });
                    removed.map(function (instance) {
                        var computor = genComputor_1(instance);
                        computes.remove(computor);
                    });
                });
                var prevResultHash;
                var nextResultHash = '';
                computedVal_1 = mobx.computed(function () {
                    nextResultHash = '';
                    var rtn = computes.reduce(function (acc, compute) {
                        var _a = compute.get(), isMatched = _a.isMatched, instance = _a.instance;
                        if (!!isMatched) {
                            nextResultHash = nextResultHash + ';' + instance.getKey();
                            acc.push(instance);
                        }
                        return acc;
                    }, []);
                    // for the first computing, set hash
                    if (prevResultHash === undefined) {
                        prevResultHash = nextResultHash;
                    }
                    return rtn;
                }, {
                    equals: function () {
                        var isEqual$$1 = prevResultHash === nextResultHash;
                        prevResultHash = nextResultHash;
                        return isEqual$$1;
                    }
                });
                // setup disposer for computedVal
                var _onBecomeUnobserved = computedVal_1.onBecomeUnobserved.bind(computedVal_1);
                computedVal_1.onBecomeUnobserved = function () {
                    _onBecomeUnobserved();
                    // dispose listener on add/remove instance
                    disposer();
                    // remove to computes cached
                    _this._store.computes.delete(condHash);
                };
            });
            this._store.computes.set(condHash, computedVal_1);
            return this._store.computes.get(condHash).get();
        }
    };
    return Model;
}());

var hasOne = function (typeFunction, options) {
    if (options === void 0) { options = {}; }
    return function (target, property) {
        var ownerKey = _.get(options, 'ownerKey', property + "Id");
        // set definition for this field
        setDefinition(target.constructor, property, __assign({}, options, { name: 'hasOne', type: hasOne, ensureData: function (data, opt) {
                if (opt === void 0) { opt = {}; }
                var Model = typeFunction();
                var val = _.get(data, property);
                if (val instanceof Model) {
                    _.set(data, ownerKey, val.getKey());
                }
                delete data[property];
            }, validation: function () {
            } }));
        // define relation to property
        Object.defineProperty(target, property, {
            get: function () {
                var Model = typeFunction();
                var itemId = this[ownerKey];
                return itemId ? Model.findById(itemId) : undefined;
            },
            set: function (newVal) {
                var _this = this;
                mobx.untracked(function () {
                    var Model = typeFunction();
                    var relationInstance = newVal instanceof Model ? newVal : Model.findById(newVal);
                    _this[ownerKey] = relationInstance ? relationInstance.getKey() : undefined;
                });
                return this;
            },
            enumerable: true,
            configurable: true
        });
        // define ownerKey property
        Column(options)(target, ownerKey);
    };
};

var hasMany = function (typeFunction, options) {
    if (options === void 0) { options = {}; }
    return function (target, property) {
        var ownerKey = _.get(options, 'ownerKey', property + "Ids");
        // set definition for this field
        setDefinition(target.constructor, property, __assign({}, options, { name: 'hasMany', type: hasMany, ensureData: function (data, opt) {
                if (opt === void 0) { opt = {}; }
                // const Model = typeFunction()                
                // let val = _.get(data, property)
                // if(Array.isArray(val)) {
                //     val = val.map(item => {
                //         // check for item exist
                //         return Model.findOrNew(item)
                //     })
                //     val = Collection.fromArray(val)
                // }
                // if(val && val instanceof Collection && val.getType() === Model) {
                //     _.set(data, ownerKey, val.keys())
                // }
                // delete data[property]
            }, validation: function () {
            } }));
        var getIdsFromItems = function (items) {
            var ids = [];
            var Model = typeFunction();
            mobx.untracked(function () {
                items.map(function (item) {
                    var instance = item instanceof Model ? item : Model.findById(item);
                    invariant(instance, "invalid or not found instance for hasMany relation \"" + property + "\"");
                    ids.push(instance.getKey());
                });
            });
            return ids;
        };
        // const _cachedRelations = new WeakMap()
        // define relation to property
        Object.defineProperty(target, property, {
            get: function () {
                var _this = this;
                // if(!_cachedRelations.has(this)) {
                var Model = typeFunction();
                var ids = this[ownerKey] || [];
                var relations = ids.map(function (id) { return Model.findById(id); });
                relations = mobx.observable(relations);
                var disposer1 = relations.intercept(function (change) {
                    var added = change.added;
                    // check for insert item must be valid
                    if (added.length) {
                        // verify added items are valid
                        try {
                            getIdsFromItems(added);
                        }
                        catch (err) {
                            console.log(err);
                            return null;
                        }
                    }
                    return change;
                });
                var disposer2 = relations.observe(function (change) {
                    var ids = getIdsFromItems(change.object);
                    if (!_.isEqual(ids, _this[ownerKey])) {
                        _this[ownerKey] = ids;
                    }
                });
                // cleanup on unobserved
                // const _onBecomeUnobserved = relations.onBecomeUnobserved.bind(relations)
                // relations.onBecomeUnobserved = () => {
                //     _onBecomeUnobserved()
                //     // dispose listener on add/remove instance
                //     disposer1()
                //     disposer2()
                // }
                // _cachedRelations.set(this, relations)
                return relations;
                // }
                // return _cachedRelations.get(this)
            },
            set: function (items) {
                var _this = this;
                mobx.transaction(function () {
                    var ids = getIdsFromItems(items);
                    if (!_.isEqual(ids, _this[ownerKey])) {
                        _this[ownerKey] = ids;
                    }
                });
            },
            enumerable: true,
            configurable: true
        });
        // define ownerKey property
        Column()(target, ownerKey);
    };
};

// export * from './belongsToMany'

exports.setDefinition = setDefinition;
exports.getDefinition = getDefinition;
exports.listDefinitions = listDefinitions;
exports.setEntityKey = setEntityKey;
exports.getEntityKey = getEntityKey;
exports.Column = Column;
exports.DataStore = DataStore;
exports.Entity = Entity;
exports.Model = Model;
exports.hasOne = hasOne;
exports.hasMany = hasMany;
