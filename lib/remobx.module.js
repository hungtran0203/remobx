/** ReMobx - (c) Hung Tran 2017 - MIT Licensed */
var globalState = {
    _updatingReaction: undefined,
    _runningReaction: undefined,
    _reactionSet: new WeakMap(),
    getReactionContext: function () {
        return globalState._runningReaction || globalState._updatingReaction;
    },
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

var ChangeToken = (function () {
    function ChangeToken(table, _id, action, options) {
        if (options === void 0) { options = {}; }
        this.table = table;
        this._id = _id;
        this.action = action;
        this.options = options;
    }
    return ChangeToken;
}());

var Transaction = (function () {
    function Transaction(reactionRunner) {
        this.reactionRunner = reactionRunner;
        this.stack = [];
        this.changes = [];
    }
    Transaction.prototype.queueChanges = function (changes) {
        this.changes = this.changes.concat(changes);
    };
    Transaction.prototype.start = function () {
        this.stack.push(true);
    };
    Transaction.prototype.end = function () {
        this.stack.pop();
        if (!this.stack.length)
            this.reaction();
    };
    Transaction.prototype.reaction = function () {
        try {
            if (typeof this.reactionRunner === 'function') {
                this.reactionRunner(this.changes);
            }
        }
        finally {
            this.changes = [];
        }
    };
    return Transaction;
}());

var ACTIONS;
(function (ACTIONS) {
    ACTIONS["INSERT"] = "insert";
    ACTIONS["UPDATE"] = "update";
    ACTIONS["REPLACE"] = "replace";
    ACTIONS["DELETE"] = "delete";
    ACTIONS["QUERY"] = "query";
    ACTIONS["FIND"] = "find";
    ACTIONS["LOAD"] = "load";
    ACTIONS["BULK"] = "bulk";
})(ACTIONS || (ACTIONS = {}));

var uuidv4 = require('uuid/v4');
var _$1 = require('lodash');
var uuid = function () {
    return _$1.toUpper(uuidv4());
};

var _$2 = require('lodash');



var select = function (object, proj) {
    var rtn = {};
    visit(proj, function (path, field, value) {
        if (value === true || value === 1) {
            _$2.set(rtn, path, _$2.get(object, path));
        }
        return true;
    });
    return rtn;
};
var traverse = function (obj, cb, path) {
    if (path === void 0) { path = ''; }
    if (typeof obj === 'object') {
        Object.keys(obj).map(function (key) {
            var field = key;
            var subPath = path ? path + "." + field : field;
            if (cb(subPath, field, obj[key])) {
                traverse(obj[key], cb, subPath);
            }
        });
    }
};
var visit = traverse;

var ReactionScheduler = (function () {
    function ReactionScheduler() {
        this.reactions = new Set();
    }
    ReactionScheduler.prototype.add = function (reaction) {
        var _this = this;
        if (Array.isArray(reaction)) {
            reaction.map(function (r) { return _this.add(r); });
        }
        else {
            this.reactions.add(reaction);
        }
    };
    ReactionScheduler.prototype.run = function () {
        this.reactions.forEach(function (r) {
            if (typeof r === 'function') {
                r();
            }
            else if (r instanceof Reaction) {
                r.update();
            }
        });
    };
    return ReactionScheduler;
}());

var _$3 = require('lodash');
var FireBase = (function () {
    function FireBase(options, store) {
        if (options === void 0) { options = {}; }
        var _this = this;
        this.store = store;
        this.middlewares = [];
        var middlewares = _$3.get(options, 'middlewares');
        if (Array.isArray(middlewares)) {
            middlewares.map(function (Middleware) {
                _this.middlewares.push(new Middleware(_this.store));
            });
        }
    }
    FireBase.prototype.subscribe = function (token, target) {
        var disposers = [];
        this.middlewares.map(function (parser) {
            var disposer = parser.subscribe(token, target);
            if (typeof disposer === 'function') {
                disposers.push(disposer);
            }
        });
        return function () {
            disposers.map(function (d) { return d(); });
        };
    };
    FireBase.prototype.dispatch = function (changes) {
        var _this = this;
        var scheduler = new ReactionScheduler();
        changes = Array.isArray(changes) ? changes : [changes];
        changes.map(function (change) {
            _this.middlewares.map(function (parser) {
                scheduler.add(parser.dispatch(change));
            });
        });
        scheduler.run();
    };
    return FireBase;
}());

function invariant(check, message, thing) {
    if (!check)
        throw new Error("[remobx] Invariant failed: " + message + (thing ? " in '" + thing + "'" : ""));
}

/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
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
var Reflect$1;
(function (Reflect) {
    var hasOwn = Object.prototype.hasOwnProperty;
    // feature test for Symbol support
    var supportsSymbol = typeof Symbol === "function";
    var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
    var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
    var HashMap;
    (function (HashMap) {
        var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
        var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
        var downLevel = !supportsCreate && !supportsProto;
        // create an object in dictionary mode (a.k.a. "slow" mode in v8)
        HashMap.create = supportsCreate
            ? function () { return MakeDictionary(Object.create(null)); }
            : supportsProto
                ? function () { return MakeDictionary({ __proto__: null }); }
                : function () { return MakeDictionary({}); };
        HashMap.has = downLevel
            ? function (map, key) { return hasOwn.call(map, key); }
            : function (map, key) { return key in map; };
        HashMap.get = downLevel
            ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
            : function (map, key) { return map[key]; };
    })(HashMap || (HashMap = {}));
    // Load global or shim versions of Map, Set, and WeakMap
    var functionPrototype = Object.getPrototypeOf(Function);
    var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
    var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
    var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
    var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
    // [[Metadata]] internal slot
    // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
    var Metadata = new _WeakMap();
    /**
      * Applies a set of decorators to a property of a target object.
      * @param decorators An array of decorators.
      * @param target The target object.
      * @param propertyKey (Optional) The property key to decorate.
      * @param attributes (Optional) The property descriptor for the target key.
      * @remarks Decorators are applied in reverse order.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     Example = Reflect.decorate(decoratorsArray, Example);
      *
      *     // property (on constructor)
      *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
      *
      *     // property (on prototype)
      *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
      *
      *     // method (on constructor)
      *     Object.defineProperty(Example, "staticMethod",
      *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
      *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
      *
      *     // method (on prototype)
      *     Object.defineProperty(Example.prototype, "method",
      *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
      *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
      *
      */
    function decorate(decorators, target, propertyKey, attributes) {
        if (!IsUndefined(propertyKey)) {
            if (!IsArray(decorators))
                throw new TypeError();
            if (!IsObject(target))
                throw new TypeError();
            if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                throw new TypeError();
            if (IsNull(attributes))
                attributes = undefined;
            propertyKey = ToPropertyKey(propertyKey);
            return DecorateProperty(decorators, target, propertyKey, attributes);
        }
        else {
            if (!IsArray(decorators))
                throw new TypeError();
            if (!IsConstructor(target))
                throw new TypeError();
            return DecorateConstructor(decorators, target);
        }
    }
    Reflect.decorate = decorate;
    // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
    // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
    /**
      * A default metadata decorator factory that can be used on a class, class member, or parameter.
      * @param metadataKey The key for the metadata entry.
      * @param metadataValue The value for the metadata entry.
      * @returns A decorator function.
      * @remarks
      * If `metadataKey` is already defined for the target and target key, the
      * metadataValue for that key will be overwritten.
      * @example
      *
      *     // constructor
      *     @Reflect.metadata(key, value)
      *     class Example {
      *     }
      *
      *     // property (on constructor, TypeScript only)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         static staticProperty;
      *     }
      *
      *     // property (on prototype, TypeScript only)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         property;
      *     }
      *
      *     // method (on constructor)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         static staticMethod() { }
      *     }
      *
      *     // method (on prototype)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         method() { }
      *     }
      *
      */
    function metadata(metadataKey, metadataValue) {
        function decorator(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
                throw new TypeError();
            OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        return decorator;
    }
    Reflect.metadata = metadata;
    /**
      * Define a unique metadata entry on the target.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param metadataValue A value that contains attached metadata.
      * @param target The target object on which to define metadata.
      * @param propertyKey (Optional) The property key for the target.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     Reflect.defineMetadata("custom:annotation", options, Example);
      *
      *     // property (on constructor)
      *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
      *
      *     // property (on prototype)
      *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
      *
      *     // method (on constructor)
      *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
      *
      *     // method (on prototype)
      *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
      *
      *     // decorator factory as metadata-producing annotation.
      *     function MyAnnotation(options): Decorator {
      *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
      *     }
      *
      */
    function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
    }
    Reflect.defineMetadata = defineMetadata;
    /**
      * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.hasMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function hasMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryHasMetadata(metadataKey, target, propertyKey);
    }
    Reflect.hasMetadata = hasMetadata;
    /**
      * Gets a value indicating whether the target object has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function hasOwnMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
    }
    Reflect.hasOwnMetadata = hasOwnMetadata;
    /**
      * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function getMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryGetMetadata(metadataKey, target, propertyKey);
    }
    Reflect.getMetadata = getMetadata;
    /**
      * Gets the metadata value for the provided metadata key on the target object.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getOwnMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function getOwnMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
    }
    Reflect.getOwnMetadata = getOwnMetadata;
    /**
      * Gets the metadata keys defined on the target object or its prototype chain.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getMetadataKeys(Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getMetadataKeys(Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getMetadataKeys(Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getMetadataKeys(Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getMetadataKeys(Example.prototype, "method");
      *
      */
    function getMetadataKeys(target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryMetadataKeys(target, propertyKey);
    }
    Reflect.getMetadataKeys = getMetadataKeys;
    /**
      * Gets the unique metadata keys defined on the target object.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getOwnMetadataKeys(Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
      *
      */
    function getOwnMetadataKeys(target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        return OrdinaryOwnMetadataKeys(target, propertyKey);
    }
    Reflect.getOwnMetadataKeys = getOwnMetadataKeys;
    /**
      * Deletes the metadata entry from the target object with the provided key.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param propertyKey (Optional) The property key for the target.
      * @returns `true` if the metadata entry was found and deleted; otherwise, false.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.deleteMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function deleteMetadata(metadataKey, target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey))
            propertyKey = ToPropertyKey(propertyKey);
        var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
        if (IsUndefined(metadataMap))
            return false;
        if (!metadataMap.delete(metadataKey))
            return false;
        if (metadataMap.size > 0)
            return true;
        var targetMetadata = Metadata.get(target);
        targetMetadata.delete(propertyKey);
        if (targetMetadata.size > 0)
            return true;
        Metadata.delete(target);
        return true;
    }
    Reflect.deleteMetadata = deleteMetadata;
    function DecorateConstructor(decorators, target) {
        for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
                if (!IsConstructor(decorated))
                    throw new TypeError();
                target = decorated;
            }
        }
        return target;
    }
    function DecorateProperty(decorators, target, propertyKey, descriptor) {
        for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target, propertyKey, descriptor);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
                if (!IsObject(decorated))
                    throw new TypeError();
                descriptor = decorated;
            }
        }
        return descriptor;
    }
    function GetOrCreateMetadataMap(O, P, Create) {
        var targetMetadata = Metadata.get(O);
        if (IsUndefined(targetMetadata)) {
            if (!Create)
                return undefined;
            targetMetadata = new _Map();
            Metadata.set(O, targetMetadata);
        }
        var metadataMap = targetMetadata.get(P);
        if (IsUndefined(metadataMap)) {
            if (!Create)
                return undefined;
            metadataMap = new _Map();
            targetMetadata.set(P, metadataMap);
        }
        return metadataMap;
    }
    // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
    function OrdinaryHasMetadata(MetadataKey, O, P) {
        var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn)
            return true;
        var parent = OrdinaryGetPrototypeOf(O);
        if (!IsNull(parent))
            return OrdinaryHasMetadata(MetadataKey, parent, P);
        return false;
    }
    // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
    function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
        if (IsUndefined(metadataMap))
            return false;
        return ToBoolean(metadataMap.has(MetadataKey));
    }
    // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
    function OrdinaryGetMetadata(MetadataKey, O, P) {
        var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn)
            return OrdinaryGetOwnMetadata(MetadataKey, O, P);
        var parent = OrdinaryGetPrototypeOf(O);
        if (!IsNull(parent))
            return OrdinaryGetMetadata(MetadataKey, parent, P);
        return undefined;
    }
    // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
    function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
        if (IsUndefined(metadataMap))
            return undefined;
        return metadataMap.get(MetadataKey);
    }
    // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
    function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
        metadataMap.set(MetadataKey, MetadataValue);
    }
    // 3.1.6.1 OrdinaryMetadataKeys(O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
    function OrdinaryMetadataKeys(O, P) {
        var ownKeys = OrdinaryOwnMetadataKeys(O, P);
        var parent = OrdinaryGetPrototypeOf(O);
        if (parent === null)
            return ownKeys;
        var parentKeys = OrdinaryMetadataKeys(parent, P);
        if (parentKeys.length <= 0)
            return ownKeys;
        if (ownKeys.length <= 0)
            return parentKeys;
        var set = new _Set();
        var keys = [];
        for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
            var key = ownKeys_1[_i];
            var hasKey = set.has(key);
            if (!hasKey) {
                set.add(key);
                keys.push(key);
            }
        }
        for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
            var key = parentKeys_1[_a];
            var hasKey = set.has(key);
            if (!hasKey) {
                set.add(key);
                keys.push(key);
            }
        }
        return keys;
    }
    // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
    // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
    function OrdinaryOwnMetadataKeys(O, P) {
        var keys = [];
        var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
        if (IsUndefined(metadataMap))
            return keys;
        var keysObj = metadataMap.keys();
        var iterator = GetIterator(keysObj);
        var k = 0;
        while (true) {
            var next = IteratorStep(iterator);
            if (!next) {
                keys.length = k;
                return keys;
            }
            var nextValue = IteratorValue(next);
            try {
                keys[k] = nextValue;
            }
            catch (e) {
                try {
                    IteratorClose(iterator);
                }
                finally {
                    throw e;
                }
            }
            k++;
        }
    }
    // 6 ECMAScript Data Typ0es and Values
    // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
    function Type(x) {
        if (x === null)
            return 1 /* Null */;
        switch (typeof x) {
            case "undefined": return 0 /* Undefined */;
            case "boolean": return 2 /* Boolean */;
            case "string": return 3 /* String */;
            case "symbol": return 4 /* Symbol */;
            case "number": return 5 /* Number */;
            case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
            default: return 6 /* Object */;
        }
    }
    // 6.1.1 The Undefined Type
    // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
    function IsUndefined(x) {
        return x === undefined;
    }
    // 6.1.2 The Null Type
    // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
    function IsNull(x) {
        return x === null;
    }
    // 6.1.5 The Symbol Type
    // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
    function IsSymbol(x) {
        return typeof x === "symbol";
    }
    // 6.1.7 The Object Type
    // https://tc39.github.io/ecma262/#sec-object-type
    function IsObject(x) {
        return typeof x === "object" ? x !== null : typeof x === "function";
    }
    // 7.1 Type Conversion
    // https://tc39.github.io/ecma262/#sec-type-conversion
    // 7.1.1 ToPrimitive(input [, PreferredType])
    // https://tc39.github.io/ecma262/#sec-toprimitive
    function ToPrimitive(input, PreferredType) {
        switch (Type(input)) {
            case 0 /* Undefined */: return input;
            case 1 /* Null */: return input;
            case 2 /* Boolean */: return input;
            case 3 /* String */: return input;
            case 4 /* Symbol */: return input;
            case 5 /* Number */: return input;
        }
        var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
        var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
        if (exoticToPrim !== undefined) {
            var result = exoticToPrim.call(input, hint);
            if (IsObject(result))
                throw new TypeError();
            return result;
        }
        return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
    }
    // 7.1.1.1 OrdinaryToPrimitive(O, hint)
    // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
    function OrdinaryToPrimitive(O, hint) {
        if (hint === "string") {
            var toString_1 = O.toString;
            if (IsCallable(toString_1)) {
                var result = toString_1.call(O);
                if (!IsObject(result))
                    return result;
            }
            var valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
                var result = valueOf.call(O);
                if (!IsObject(result))
                    return result;
            }
        }
        else {
            var valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
                var result = valueOf.call(O);
                if (!IsObject(result))
                    return result;
            }
            var toString_2 = O.toString;
            if (IsCallable(toString_2)) {
                var result = toString_2.call(O);
                if (!IsObject(result))
                    return result;
            }
        }
        throw new TypeError();
    }
    // 7.1.2 ToBoolean(argument)
    // https://tc39.github.io/ecma262/2016/#sec-toboolean
    function ToBoolean(argument) {
        return !!argument;
    }
    // 7.1.12 ToString(argument)
    // https://tc39.github.io/ecma262/#sec-tostring
    function ToString(argument) {
        return "" + argument;
    }
    // 7.1.14 ToPropertyKey(argument)
    // https://tc39.github.io/ecma262/#sec-topropertykey
    function ToPropertyKey(argument) {
        var key = ToPrimitive(argument, 3 /* String */);
        if (IsSymbol(key))
            return key;
        return ToString(key);
    }
    // 7.2 Testing and Comparison Operations
    // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
    // 7.2.2 IsArray(argument)
    // https://tc39.github.io/ecma262/#sec-isarray
    function IsArray(argument) {
        return Array.isArray
            ? Array.isArray(argument)
            : argument instanceof Object
                ? argument instanceof Array
                : Object.prototype.toString.call(argument) === "[object Array]";
    }
    // 7.2.3 IsCallable(argument)
    // https://tc39.github.io/ecma262/#sec-iscallable
    function IsCallable(argument) {
        // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
        return typeof argument === "function";
    }
    // 7.2.4 IsConstructor(argument)
    // https://tc39.github.io/ecma262/#sec-isconstructor
    function IsConstructor(argument) {
        // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
        return typeof argument === "function";
    }
    // 7.2.7 IsPropertyKey(argument)
    // https://tc39.github.io/ecma262/#sec-ispropertykey
    function IsPropertyKey(argument) {
        switch (Type(argument)) {
            case 3 /* String */: return true;
            case 4 /* Symbol */: return true;
            default: return false;
        }
    }
    // 7.3 Operations on Objects
    // https://tc39.github.io/ecma262/#sec-operations-on-objects
    // 7.3.9 GetMethod(V, P)
    // https://tc39.github.io/ecma262/#sec-getmethod
    function GetMethod(V, P) {
        var func = V[P];
        if (func === undefined || func === null)
            return undefined;
        if (!IsCallable(func))
            throw new TypeError();
        return func;
    }
    // 7.4 Operations on Iterator Objects
    // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
    function GetIterator(obj) {
        var method = GetMethod(obj, iteratorSymbol);
        if (!IsCallable(method))
            throw new TypeError(); // from Call
        var iterator = method.call(obj);
        if (!IsObject(iterator))
            throw new TypeError();
        return iterator;
    }
    // 7.4.4 IteratorValue(iterResult)
    // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
    function IteratorValue(iterResult) {
        return iterResult.value;
    }
    // 7.4.5 IteratorStep(iterator)
    // https://tc39.github.io/ecma262/#sec-iteratorstep
    function IteratorStep(iterator) {
        var result = iterator.next();
        return result.done ? false : result;
    }
    // 7.4.6 IteratorClose(iterator, completion)
    // https://tc39.github.io/ecma262/#sec-iteratorclose
    function IteratorClose(iterator) {
        var f = iterator["return"];
        if (f)
            f.call(iterator);
    }
    // 9.1 Ordinary Object Internal Methods and Internal Slots
    // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
    // 9.1.1.1 OrdinaryGetPrototypeOf(O)
    // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
    function OrdinaryGetPrototypeOf(O) {
        var proto = Object.getPrototypeOf(O);
        if (typeof O !== "function" || O === functionPrototype)
            return proto;
        // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
        // Try to determine the superclass constructor. Compatible implementations
        // must either set __proto__ on a subclass constructor to the superclass constructor,
        // or ensure each class has a valid `constructor` property on its prototype that
        // points back to the constructor.
        // If this is not the same as Function.[[Prototype]], then this is definately inherited.
        // This is the case when in ES6 or when using __proto__ in a compatible browser.
        if (proto !== functionPrototype)
            return proto;
        // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
        var prototype = O.prototype;
        var prototypeProto = prototype && Object.getPrototypeOf(prototype);
        if (prototypeProto == null || prototypeProto === Object.prototype)
            return proto;
        // If the constructor was not a function, then we cannot determine the heritage.
        var constructor = prototypeProto.constructor;
        if (typeof constructor !== "function")
            return proto;
        // If we have some kind of self-reference, then we cannot determine the heritage.
        if (constructor === O)
            return proto;
        // we have a pretty good guess at the heritage.
        return constructor;
    }
    // naive Map shim
    function CreateMapPolyfill() {
        var cacheSentinel = {};
        var arraySentinel = [];
        var MapIterator = (function () {
            function MapIterator(keys, values, selector) {
                this._index = 0;
                this._keys = keys;
                this._values = values;
                this._selector = selector;
            }
            MapIterator.prototype["@@iterator"] = function () { return this; };
            MapIterator.prototype[iteratorSymbol] = function () { return this; };
            MapIterator.prototype.next = function () {
                var index = this._index;
                if (index >= 0 && index < this._keys.length) {
                    var result = this._selector(this._keys[index], this._values[index]);
                    if (index + 1 >= this._keys.length) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    else {
                        this._index++;
                    }
                    return { value: result, done: false };
                }
                return { value: undefined, done: true };
            };
            MapIterator.prototype.throw = function (error) {
                if (this._index >= 0) {
                    this._index = -1;
                    this._keys = arraySentinel;
                    this._values = arraySentinel;
                }
                throw error;
            };
            MapIterator.prototype.return = function (value) {
                if (this._index >= 0) {
                    this._index = -1;
                    this._keys = arraySentinel;
                    this._values = arraySentinel;
                }
                return { value: value, done: true };
            };
            return MapIterator;
        }());
        return (function () {
            function Map() {
                this._keys = [];
                this._values = [];
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
            }
            Object.defineProperty(Map.prototype, "size", {
                get: function () { return this._keys.length; },
                enumerable: true,
                configurable: true
            });
            Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
            Map.prototype.get = function (key) {
                var index = this._find(key, /*insert*/ false);
                return index >= 0 ? this._values[index] : undefined;
            };
            Map.prototype.set = function (key, value) {
                var index = this._find(key, /*insert*/ true);
                this._values[index] = value;
                return this;
            };
            Map.prototype.delete = function (key) {
                var index = this._find(key, /*insert*/ false);
                if (index >= 0) {
                    var size = this._keys.length;
                    for (var i = index + 1; i < size; i++) {
                        this._keys[i - 1] = this._keys[i];
                        this._values[i - 1] = this._values[i];
                    }
                    this._keys.length--;
                    this._values.length--;
                    if (key === this._cacheKey) {
                        this._cacheKey = cacheSentinel;
                        this._cacheIndex = -2;
                    }
                    return true;
                }
                return false;
            };
            Map.prototype.clear = function () {
                this._keys.length = 0;
                this._values.length = 0;
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
            };
            Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
            Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
            Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
            Map.prototype["@@iterator"] = function () { return this.entries(); };
            Map.prototype[iteratorSymbol] = function () { return this.entries(); };
            Map.prototype._find = function (key, insert) {
                if (this._cacheKey !== key) {
                    this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
                }
                if (this._cacheIndex < 0 && insert) {
                    this._cacheIndex = this._keys.length;
                    this._keys.push(key);
                    this._values.push(undefined);
                }
                return this._cacheIndex;
            };
            return Map;
        }());
        function getKey(key, _) {
            return key;
        }
        function getValue(_, value) {
            return value;
        }
        function getEntry(key, value) {
            return [key, value];
        }
    }
    // naive Set shim
    function CreateSetPolyfill() {
        return (function () {
            function Set() {
                this._map = new _Map();
            }
            Object.defineProperty(Set.prototype, "size", {
                get: function () { return this._map.size; },
                enumerable: true,
                configurable: true
            });
            Set.prototype.has = function (value) { return this._map.has(value); };
            Set.prototype.add = function (value) { return this._map.set(value, value), this; };
            Set.prototype.delete = function (value) { return this._map.delete(value); };
            Set.prototype.clear = function () { this._map.clear(); };
            Set.prototype.keys = function () { return this._map.keys(); };
            Set.prototype.values = function () { return this._map.values(); };
            Set.prototype.entries = function () { return this._map.entries(); };
            Set.prototype["@@iterator"] = function () { return this.keys(); };
            Set.prototype[iteratorSymbol] = function () { return this.keys(); };
            return Set;
        }());
    }
    // naive WeakMap shim
    function CreateWeakMapPolyfill() {
        var UUID_SIZE = 16;
        var keys = HashMap.create();
        var rootKey = CreateUniqueKey();
        return (function () {
            function WeakMap() {
                this._key = CreateUniqueKey();
            }
            WeakMap.prototype.has = function (target) {
                var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                return table !== undefined ? HashMap.has(table, this._key) : false;
            };
            WeakMap.prototype.get = function (target) {
                var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                return table !== undefined ? HashMap.get(table, this._key) : undefined;
            };
            WeakMap.prototype.set = function (target, value) {
                var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                table[this._key] = value;
                return this;
            };
            WeakMap.prototype.delete = function (target) {
                var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                return table !== undefined ? delete table[this._key] : false;
            };
            WeakMap.prototype.clear = function () {
                // NOTE: not a real clear, just makes the previous data unreachable
                this._key = CreateUniqueKey();
            };
            return WeakMap;
        }());
        function CreateUniqueKey() {
            var key;
            do
                key = "@@WeakMap@@" + CreateUUID();
            while (HashMap.has(keys, key));
            keys[key] = true;
            return key;
        }
        function GetOrCreateWeakMapTable(target, create) {
            if (!hasOwn.call(target, rootKey)) {
                if (!create)
                    return undefined;
                Object.defineProperty(target, rootKey, { value: HashMap.create() });
            }
            return target[rootKey];
        }
        function FillRandomBytes(buffer, size) {
            for (var i = 0; i < size; ++i)
                buffer[i] = Math.random() * 0xff | 0;
            return buffer;
        }
        function GenRandomBytes(size) {
            if (typeof Uint8Array === "function") {
                if (typeof crypto !== "undefined")
                    return crypto.getRandomValues(new Uint8Array(size));
                if (typeof msCrypto !== "undefined")
                    return msCrypto.getRandomValues(new Uint8Array(size));
                return FillRandomBytes(new Uint8Array(size), size);
            }
            return FillRandomBytes(new Array(size), size);
        }
        function CreateUUID() {
            var data = GenRandomBytes(UUID_SIZE);
            // mark as random - RFC 4122 § 4.4
            data[6] = data[6] & 0x4f | 0x40;
            data[8] = data[8] & 0xbf | 0x80;
            var result = "";
            for (var offset = 0; offset < UUID_SIZE; ++offset) {
                var byte = data[offset];
                if (offset === 4 || offset === 6 || offset === 8)
                    result += "-";
                if (byte < 16)
                    result += "0";
                result += byte.toString(16).toLowerCase();
            }
            return result;
        }
    }
    // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
    function MakeDictionary(obj) {
        obj.__ = undefined;
        delete obj.__;
        return obj;
    }
    // patch global Reflect
    (function (__global) {
        if (typeof __global.Reflect !== "undefined") {
            if (__global.Reflect !== Reflect) {
                for (var p in Reflect) {
                    if (hasOwn.call(Reflect, p)) {
                        __global.Reflect[p] = Reflect[p];
                    }
                }
            }
        }
        else {
            __global.Reflect = Reflect;
        }
    })(typeof global !== "undefined" ? global :
        typeof self !== "undefined" ? self :
            Function("return this;")());
})(Reflect$1 || (Reflect$1 = {}));

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
var setTableKey = function (table, keyName) {
    _tableKeys.set(table, keyName);
};
var getTableKey = function (table) {
    return _tableKeys.get(table);
};

var _$4 = require('lodash');
var PARSER_TYPE = 'model';
var ModelMiddleware = (function () {
    function ModelMiddleware(store) {
        this.store = store;
        this.data = {};
        this.subscribers = new Map();
        this.trackedTagsByReaction = new WeakMap();
    }
    ModelMiddleware.tokenBuilder = function (tableName, _id, prop) {
        return {
            type: PARSER_TYPE,
            table: tableName,
            _id: _id,
            prop: prop
        };
    };
    ModelMiddleware.prototype.parseSubsToken = function (token) {
        var type = token.type, prop = token.prop;
        if (type === PARSER_TYPE) {
            return {
                tag: this.serializeToken(token),
                prop: prop,
            };
        }
    };
    ModelMiddleware.prototype.setTrackedPropVal = function (reaction, tag, prop, val) {
        this.getTrackedProps(reaction, tag).set(prop, val);
    };
    ModelMiddleware.prototype.getTrackedProps = function (reaction, tag) {
        if (!this.trackedTagsByReaction.has(reaction)) {
            this.trackedTagsByReaction.set(reaction, new Map());
        }
        var trackedTagsByReaction = this.trackedTagsByReaction.get(reaction);
        if (!trackedTagsByReaction.has(tag)) {
            trackedTagsByReaction.set(tag, new Map());
        }
        return trackedTagsByReaction;
    };
    ModelMiddleware.prototype.subscribe = function (token, reaction) {
        var _token = this.parseSubsToken(token);
        if (_token) {
            if (!this.subscribers.has(_token.tag)) {
                this.subscribers.set(_token.tag, new Set());
            }
            var tokenSubscribers_1 = this.subscribers.get(_token.tag);
            tokenSubscribers_1.add(reaction);
            // store prop value at subscribe time
            var prop = token.prop, table = token.table, _id = token._id;
            this.setTrackedPropVal(reaction, _token.tag, prop, this.store.get(table, _id, prop));
            if (reaction.isTrackEnabled()) {
                console.log("[trackTrace] tracking", _token.tag, prop);
            }
            return function () {
                tokenSubscribers_1.delete(reaction);
            };
        }
    };
    ModelMiddleware.prototype.dispatch = function (change) {
        var _this = this;
        var tag = this.serializeToken(change);
        var reactionSubscribers = this.subscribers.get(tag);
        var rtn = [];
        var _a = change, table = _a.table, _id = _a._id, action = _a.action;
        if (reactionSubscribers) {
            reactionSubscribers.forEach(function (reaction) {
                switch (action) {
                    case ACTIONS.INSERT:
                    case ACTIONS.DELETE:
                        rtn.push(reaction);
                        break;
                    case ACTIONS.UPDATE:
                        var trackedProps = _this.getTrackedProps(reaction, tag);
                        // check if value is changed
                        var shouldUpdate_1 = false;
                        trackedProps.forEach(function (value, prop) {
                            var newVal = _this.store.get(table, _id, prop);
                            if (!_$4.isEqual(value, newVal)) {
                                // update run reason
                                reaction.addRunReason({
                                    target: {
                                        table: table,
                                        _id: _id,
                                        prop: prop,
                                    },
                                    oldVal: value,
                                    newVal: newVal
                                });
                                shouldUpdate_1 = true;
                            }
                        });
                        if (shouldUpdate_1) {
                            rtn.push(reaction);
                        }
                        break;
                }
            });
        }
        return rtn;
    };
    ModelMiddleware.prototype.serializeToken = function (token) {
        return token.table + "::" + token._id;
    };
    ModelMiddleware.type = PARSER_TYPE;
    return ModelMiddleware;
}());

var PARSER_TYPE$1 = 'collection';
var _$5 = require('lodash');
var CollectionMiddleware = (function () {
    function CollectionMiddleware(store) {
        this.store = store;
        this.data = {};
        this.subscribers = new Map();
        this.trackedTagsByReaction = new WeakMap();
        this.reactionVersionTracking = new WeakMap();
    }
    CollectionMiddleware.tokenBuilder = function (options) {
        var table = options.table;
        if (table) {
            return __assign({ type: PARSER_TYPE$1 }, options);
        }
    };
    CollectionMiddleware.prototype.parseSubsToken = function (token) {
        var type = token.type, valGetter = token.valGetter, table = token.table;
        if (type === PARSER_TYPE$1 && table && typeof valGetter === 'function') {
            return __assign({ tag: this.getTagFromToken(token) }, token);
        }
    };
    CollectionMiddleware.prototype.setTrackedToken = function (reaction, tag, valGetter, value) {
        this.getTrackedTokens(reaction, tag).set(valGetter, value);
    };
    CollectionMiddleware.prototype.getTrackedTokens = function (reaction, tag) {
        /**
         * each reaction has a list of token onTracked,
         * the onTracked Token list is wipe out each time reaction version is changed
         */
        var currentVersion = reaction.getVersion();
        var trackedVersion = this.reactionVersionTracking.get(reaction);
        if (currentVersion !== trackedVersion) {
            // update tracked version and wipe out tracked token list of the reaction
            this.reactionVersionTracking.set(reaction, currentVersion);
            this.trackedTagsByReaction.set(reaction, new Map());
        }
        var trackedTagsByReaction = this.trackedTagsByReaction.get(reaction);
        if (!trackedTagsByReaction.has(tag)) {
            trackedTagsByReaction.set(tag, new Map());
        }
        return trackedTagsByReaction.get(tag);
    };
    CollectionMiddleware.prototype.subscribe = function (token, reaction) {
        var _token = this.parseSubsToken(token);
        var tag = this.getTagFromToken(token);
        if (_token) {
            if (!this.subscribers.has(tag)) {
                this.subscribers.set(tag, new Set());
            }
            var subscribers_1 = this.subscribers.get(tag);
            subscribers_1.add(reaction);
            // store prop value at subscribe time
            // use valGetter as track key
            var valGetter = token.valGetter, initVal = token.initVal;
            this.setTrackedToken(reaction, tag, valGetter, initVal);
            if (reaction.isTrackEnabled()) {
                console.log("[trackTrace] tracking", tag, token.description, initVal);
            }
            return function () {
                subscribers_1.delete(reaction);
            };
        }
    };
    CollectionMiddleware.prototype.dispatch = function (change) {
        var _this = this;
        var tag = this.getTagFromToken(change);
        var reactionSubscribers = this.subscribers.get(tag);
        var rtn = [];
        var _a = change, action = _a.action, table = _a.table, _id = _a._id;
        if (reactionSubscribers) {
            reactionSubscribers.forEach(function (reaction) {
                switch (action) {
                    case ACTIONS.INSERT:
                    case ACTIONS.DELETE:
                    case ACTIONS.UPDATE:
                        var trackedConditions = _this.getTrackedTokens(reaction, tag);
                        // check if value is changed
                        var shouldUpdate_1 = false;
                        trackedConditions.forEach(function (val, valGetter) {
                            // const newVal = 
                            var newVal = valGetter();
                            if (!_$5.isEqual(val, newVal)) {
                                reaction.addRunReason({
                                    target: {
                                        table: table,
                                        _id: _id,
                                    },
                                    oldVal: val,
                                    newVal: newVal,
                                    reason: 'collection update'
                                });
                                shouldUpdate_1 = true;
                                // update track val
                                // token.val = newVal
                            }
                        });
                        if (shouldUpdate_1) {
                            rtn.push(reaction);
                        }
                        break;
                }
            });
        }
        return rtn;
    };
    CollectionMiddleware.prototype.getTagFromToken = function (token) {
        return "" + token.table;
    };
    CollectionMiddleware.type = PARSER_TYPE$1;
    return CollectionMiddleware;
}());

var _ = require('lodash');
var update = require('immutability-helper');
var sift = require('sift');
var Store = (function () {
    function Store(options) {
        var _this = this;
        this.options = options;
        this.data = {};
        this.transaction = new Transaction(function (changes) { return _this.firebase.dispatch(changes); });
        // init firebase
        this.firebase = new FireBase(this.options, this);
    }
    Store.prototype.insert = function (table, data) {
        var _id = Store._getKey(table, data);
        _.set(this.data, table + "." + _id, __assign({}, data, (_a = {}, _a[Store._getKeyName(table)] = _id, _a)));
        var changes = [new ChangeToken(table, _id, ACTIONS.INSERT)];
        // dispatch changes
        this.dispatchChanges(changes);
        return changes;
        var _a;
    };
    Store.prototype.update = function (table, _id, query) {
        var changes = [];
        if (_id) {
            var oldData = this.data[table][_id];
            if (oldData) {
                _.set(this.data, table + "." + _id, update(oldData, query));
                if (oldData !== this.data[table][_id]) {
                    changes.push(new ChangeToken(table, _id, ACTIONS.UPDATE, { nextVal: this.data[table[_id]], prevVal: oldData }));
                }
            }
        }
        // dispatch changes
        this.dispatchChanges(changes);
        return changes;
    };
    Store.prototype.query = function (table, cond, selection) {
        if (selection === void 0) { selection = {}; }
        var tableData = _.get(this.data, table, {});
        var compareFunc = function (obj) { return !!sift(cond, [obj]).length; };
        var items = [];
        Object.keys(tableData).map(function (_id) {
            if (compareFunc(tableData[_id])) {
                var item = Object.keys(selection).length ? select(tableData[_id], selection) : tableData[_id];
                items.push(item);
            }
        });
        return items;
    };
    Store.prototype.find = function (table, id, selection) {
        if (selection === void 0) { selection = {}; }
        var tableData = _.get(this.data, table, {});
        return _.get(tableData, id);
    };
    Store.prototype.delete = function (table, _id) {
        var _this = this;
        var changes = [];
        var ids;
        var keyName = Store._getKeyName(table);
        if (typeof _id !== 'string') {
            ids = this.query(table, _id, (_a = {}, _a[keyName] = true, _a)).map(function (item) { return item[keyName]; });
        }
        else if (!Array.isArray(_id)) {
            ids = [_id];
        }
        else {
            ids = _id;
        }
        ids.map(function (_id) {
            var oldData = _.get(_this.data, table + "." + _id);
            if (oldData !== undefined) {
                delete _this.data[table][_id];
                changes.push(new ChangeToken(table, _id, ACTIONS.DELETE, { prevVal: oldData }));
            }
        });
        // dispatch changes
        this.dispatchChanges(changes);
        return changes;
        var _a;
    };
    Store.prototype.startTransaction = function () {
        this.transaction.start();
    };
    Store.prototype.endTransaction = function () {
        this.transaction.end();
    };
    Store.prototype.dispatchChanges = function (changes) {
        this.startTransaction();
        this.transaction.queueChanges(changes);
        this.endTransaction();
    };
    Store._getKey = function (table, data) {
        var keyName = this._getKeyName(table);
        return _.get(data, keyName, uuid());
    };
    Store._getKeyName = function (table) {
        var keyName = getTableKey(table) || '_id';
        return keyName;
    };
    Store.prototype.debug = function () {
        console.log('debug store', this.data);
    };
    Store.prototype.get = function (table, _id, property, defaultValue) {
        return _.get(this.data, table + "." + _id + (property === undefined ? '' : ('.' + property)), defaultValue);
    };
    Store.prototype.subscribe = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = this.firebase).subscribe.apply(_a, args);
        var _a;
    };
    return Store;
}());

var _store;
var initStore = function (options) {
    if (options === void 0) { options = {}; }
    if (!_store) {
        _store = new Store(options);
    }
    return _store;
};
var initDefaultStore = function () {
    initStore({ middlewares: [ModelMiddleware, CollectionMiddleware] });
};
var getStore = function (initDefault) {
    if (initDefault === void 0) { initDefault = true; }
    if (initDefault && !_store) {
        initDefaultStore();
    }
    invariant(_store, 'Store is not initialized, use "initStore(options) before gettings access to store.');
    return _store;
};

var _auto_incr_id = 0;
var Reaction = (function () {
    function Reaction(reactionRunner) {
        var _this = this;
        this.reactionRunner = reactionRunner;
        this.trackObjects = new Map();
        this.disposers = new Map();
        this._runReasons = [];
        this._trackTrace = false;
        this._isUpdating = false;
        this._id = 0;
        this._v = 0;
        this.dispose = function () {
            _this.disposers.forEach(function (disposer) {
                disposer();
            });
        };
        this._id = ++_auto_incr_id;
    }
    Reaction.prototype.run = function () {
        if (typeof this.reactionRunner === 'function') {
            this.reactionRunner();
        }
    };
    Reaction.prototype.whyRun = function () {
        console.log("[whyRun] _v=" + this.getVersion(), this._runReasons);
    };
    Reaction.prototype.addRunReason = function (reason) {
        this._runReasons.push(reason);
    };
    Reaction.prototype.trackTrace = function (enable) {
        this._trackTrace = !!enable;
    };
    Reaction.prototype.isTrackEnabled = function () {
        return !!this._trackTrace;
    };
    Reaction.prototype.getVersion = function () {
        return this._v;
    };
    Reaction.prototype.update = function () {
        try {
            globalState._updatingReaction = this;
            this._isUpdating = true;
            this._v++;
            this.run();
        }
        finally {
            globalState._updatingReaction = undefined;
            this._isUpdating = false;
        }
    };
    Reaction.prototype.track = function (token) {
        var store = getStore();
        var disposer = store.subscribe(token, this);
        this.disposers.set(token, disposer);
    };
    Reaction.prototype.hasTrack = function (obj, prop) {
        return this.trackObjects.has(obj) && this.trackObjects.get(obj).has(prop);
    };
    Reaction.prototype.getHashKey = function () {
        return this._id;
    };
    Reaction.store = new WeakMap();
    return Reaction;
}());

var autorun = function (reactionRunner) {
    var disposer;
    try {
        if (globalState._reactionSet.has(reactionRunner)) {
            globalState._runningReaction = globalState._reactionSet.get(reactionRunner);
            disposer = globalState._runningReaction.dispose;
            globalState._runningReaction.update();
        }
        else {
            globalState._reactionSet.set(reactionRunner, new Reaction(reactionRunner));
            globalState._runningReaction = globalState._reactionSet.get(reactionRunner);
            disposer = globalState._runningReaction.dispose;
            globalState._runningReaction.run();
        }
    }
    finally {
        globalState._runningReaction = undefined;
    }
    return disposer;
};

/**
 * Utilities
 */
function patch(target, funcName, runMixinFirst) {
    if (runMixinFirst === void 0) { runMixinFirst = false; }
    var base = target[funcName];
    var mixinFunc = reactiveMixin[funcName];
    var f = !base
        ? mixinFunc
        : runMixinFirst === true
            ? function () {
                mixinFunc.apply(this, arguments);
                base.apply(this, arguments);
            }
            : function () {
                base.apply(this, arguments);
                mixinFunc.apply(this, arguments);
            };
    target[funcName] = f;
}
function mixinLifecycleEvents(target) {
    patch(target, "componentWillMount", true);
    patch(target, "componentWillUnmount");
}
/**
 * ReactiveMixin
 */
var disposers = new WeakMap();
var reactiveMixin = {
    componentWillMount: function () {
        var _this = this;
        // wire up reactive render
        var baseRender = this['render'].bind(this);
        var reactInstance = this;
        var renderStack = [];
        var isInited = false;
        var isReactRenderTrigger = false;
        var autoRender = function () {
            renderStack.push(baseRender());
            // forupdate on autorun
            if (!isReactRenderTrigger) {
                isInited && reactInstance['forceUpdate'].call(reactInstance);
            }
        };
        var reactRender = function () {
            if (!renderStack.length) {
                isReactRenderTrigger = true;
                autorun(autoRender);
                isReactRenderTrigger = false;
            }
            var rtn = renderStack[renderStack.length - 1];
            renderStack = [];
            return rtn;
        };
        var initialRender = function () {
            disposers.set(_this, autorun(autoRender));
            isInited = true;
            _this['render'] = reactRender;
            return renderStack.shift();
        };
        this['render'] = initialRender;
    },
    componentWillUnmount: function () {
        if (disposers.has(this)) {
            var disposer = disposers.get(this);
            if (typeof disposer === 'function') {
                disposer();
            }
        }
        // cleanup reaction
    },
    componentDidMount: function () { },
    componentDidUpdate: function () { },
    shouldComponentUpdate: function (nextProps, nextState) { }
};
var observer = function (BaseComponent) {
    var target = BaseComponent.prototype || BaseComponent;
    mixinLifecycleEvents(target);
    return BaseComponent;
};

var _$6 = require('lodash');
var Collection = (function () {
    function Collection(Model, options) {
        if (options === void 0) { options = {}; }
        this.Model = Model;
        this.options = options;
    }
    Object.defineProperty(Collection.prototype, "items", {
        get: function () {
            var getter = _$6.get(this.options, 'resolver');
            if (typeof getter === 'function') {
                var items = getter();
                // access to all will trigger collection tracking
                this._track(items);
                return items;
            }
            return _$6.get(this.options, 'items', []);
        },
        enumerable: true,
        configurable: true
    });
    Collection.getInstance = function (Model, options) {
        if (options === void 0) { options = {}; }
        return new Collection(Model, options);
    };
    Collection.fromArray = function (models) {
        if (Array.isArray(models)) {
            var Model_1 = _$6.get(models, '0.constructor');
            var items = models.map(function (model) {
                invariant(model.constructor === Model_1, 'Collection::fromArray only accept an array of Models with the same schema');
                return model.getKey();
            });
            // init collection from array does not have resolver so it will not be able to track
            return this.getInstance(Model_1, { items: items });
        }
        return null;
    };
    Collection.prototype.getType = function () {
        return this.Model;
    };
    Collection.prototype._track = function (items) {
        var reactionContext = globalState.getReactionContext();
        var valGetter = _$6.get(this.options, 'resolver');
        if (reactionContext && valGetter) {
            var token = CollectionMiddleware.tokenBuilder({ initVal: items, valGetter: valGetter, table: this.Model.getTableName() });
            reactionContext.track(token);
        }
    };
    /**
     * @returns the underlying array represented by the collection
     */
    Collection.prototype.all = function () {
        var _this = this;
        return this.items.map(function (_id) { return _this.Model.getInstance(_id); });
    };
    /**
     * breaks the collection into multiple, smaller collections of a given size.
     * @param size
     */
    Collection.prototype.chunk = function (size) {
        var _this = this;
        var chunks = _$6.chunk(this.items, size);
        return chunks.map(function (chunk) { return Collection.getInstance(_this.Model, __assign({}, _this.options, { items: chunk })); });
    };
    /**
     * determines whether the collection contains a given item
     * @param item
     */
    Collection.prototype.contains = function (item) {
    };
    /**
     * iterates over the items in the collection and passes each item to a iterator
     * If you would like to stop iterating through the items, you may return false from your callback
     * @param iterator
     */
    Collection.prototype.forEach = function (iterator) {
    };
    /**
     * Iterates over elements of collection, returning the first element callback returns truthy for.
     * The callback is invoked with arguments: (value, index|key)
     */
    Collection.prototype.find = function (callback, fromIndex) {
        return _$6.find(this.all(), callback, fromIndex);
    };
    /**
     * Iterates over elements of collection from right to left, returning the first element callback returns truthy for.
     * The callback is invoked with arguments: (value, index|key)
     */
    Collection.prototype.findLast = function (callback, fromIndex) {
        return _$6.findLast(this.all(), callback, fromIndex);
    };
    /**
     * filters the collection using the given callback, keeping only those items that pass a given truth test
     * @param callback
     */
    Collection.prototype.filter = function (predicate) {
        var orderedItems = _$6.filter(this.all(), predicate);
        return Collection.fromArray(orderedItems);
    };
    /**
     * returns the first element in the collection that passes a given truth test
     * You may also call the first method with no arguments to get the first element in the collection
     * @param callback
     */
    Collection.prototype.first = function (callback) {
        var _this = this;
        var foundId;
        if (typeof callback === 'function') {
            foundId = this.items.find(function (id, index) {
                return callback(_this.Model.getInstance(id), index);
            });
        }
        else {
            foundId = _$6.get(this.items, '0');
        }
        var rtn = foundId === undefined ? foundId : this.Model.getInstance(foundId);
        return rtn;
    };
    /**
     * returns the item at a given path. If the key does not exist, defaultValue || undefined is returned
     * @param path
     */
    Collection.prototype.get = function (path, defaultValue) {
        return _$6.get(this.all(), path, defaultValue);
    };
    /**
     * determines if a given key exists in the collection
     * @param key
     */
    Collection.prototype.has = function (key) {
        return this.items.indexOf(key) >= 0;
    };
    /**
     * returns true if the collection is empty; otherwise, false is returned
     */
    Collection.prototype.isEmpty = function () {
        return !this.items.length;
    };
    /**
     * returns true if the collection is not empty; otherwise, false is returned
     */
    Collection.prototype.isNotEmpty = function () {
        return !!this.items.length;
    };
    /**
     * returns all of the collection's key
     */
    Collection.prototype.keys = function () {
        return this.items;
    };
    /**
     * returns the last element in the collection that passes a given truth test
     * You may also call the last method with no arguments to get the last element in the collection.
     * @param callback
     */
    Collection.prototype.last = function (callback) {
    };
    /**
     * iterates through the collection and passes each value to the given callback.
     * The callback is free to modify the item and return it, thus forming a new collection of modified items
     * @param callback
     */
    Collection.prototype.map = function (callback) {
        var _this = this;
        invariant(typeof callback === 'function', "map callback argument must be a function");
        return this.items.map(function (currentValue, currentIndex) {
            return callback(_this.Model.getInstance(currentValue), currentIndex);
        });
    };
    Collection.prototype.lists = function (property) {
        var _this = this;
        return this.items.map(function (_id) {
            return _$6.get(_this.Model.getInstance(_id), property);
        });
    };
    /**
     * separate elements that pass a given truth test from those that do not
     * @param callback
     */
    Collection.prototype.partition = function (callback) {
        var _a = _$6.partition(this.all(), callback), truthyItems = _a[0], falsyItems = _a[1];
        return [Collection.fromArray(truthyItems), Collection.fromArray(falsyItems)];
    };
    /**
     * return new collection without the last item compares to the collection
     */
    Collection.prototype.pop = function () {
        if (this.size()) {
            var items = this.items.slice(0, this.items.length - 1);
            this._doChange(items);
            return Collection.getInstance(this.Model, { items: items });
        }
    };
    /**
     * return new collection with the additional item at the end
     */
    Collection.prototype.push = function (item) {
        var Model = _$6.get(item, 'constructor');
        invariant(this.Model === Model, "push item must be an instance of " + this.getType().name);
        var items = this.items.concat(item.getKey());
        this._doChange(items);
        return Collection.getInstance(Model, { items: items });
    };
    /**
     * Creates a new collection concatenating the collection with any additional arrays and/or values.
     */
    Collection.prototype.concat = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var Model = _$6.get(items, '0.constructor');
        var ids = items.map(function (item) {
            invariant(item.constructor === Model, "Collection::concat only accept additional item is instance of " + _this.getType().name);
            return item.getKey();
        });
        return Collection.getInstance(Model, { items: ids });
    };
    /**
     * removes and returns the first item from the collection
     */
    Collection.prototype.shift = function () {
        if (this.size()) {
            var items = this.items.slice(1);
            this._doChange(items);
            return Collection.getInstance(this.Model, { items: items });
        }
    };
    Collection.prototype.unshift = function (item) {
        var Model = _$6.get(item, 'constructor');
        invariant(this.Model === Model, "unshift item must be an instance of " + this.getType().name);
        var items = [item.getKeys()].concat(this.items);
        this._doChange(items);
        return Collection.getInstance(Model, { items: items });
    };
    /**
     * reduces the collection to a single value, passing the result of each iteration into the subsequent iteration
     */
    Collection.prototype.reduce = function (callback, initialValue) {
        var _this = this;
        invariant(typeof callback === 'function', "reduce callback argument must be a function");
        return this.items.reduce(function (accumulator, currentValue, currentIndex) {
            return callback(accumulator, _this.Model.getInstance(currentValue), currentIndex);
        }, initialValue);
    };
    /**
     * return a collection with items in reversed ordering
     */
    Collection.prototype.reverse = function () {
        var reItems = _$6.reverse(this.items.slice());
        return Collection.getInstance(this.Model, reItems);
    };
    /**
     * Iterates over elements of collection, returning the first element callback returns truthy for.
     * The callback is invoked with arguments: (value, index|key)
     */
    Collection.prototype.remove = function (callback) {
        var itemsToDelete = this.filter(callback).keys();
        var items = _$6.filter(this.items, function (id) {
            return itemsToDelete.indexOf(id) < 0;
        });
        this._doChange(items);
        return Collection.getInstance(this.Model, { items: items });
    };
    /**
     * returns a slice of the collection starting at the given index without changing collection
     */
    Collection.prototype.slice = function (startIndex, length) {
        var sliceItems = this.items.slice(startIndex, length);
        return Collection.getInstance(this.Model, __assign({}, this.options, { items: sliceItems }));
    };
    /**
     * changes the contents of a collection by removing existing elements and/or adding new elements
     * @param startIndex
     * @param deleteCount
     * @param newItems
     */
    Collection.prototype.splice = function (startIndex, deleteCount) {
        var _this = this;
        var newItems = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            newItems[_i - 2] = arguments[_i];
        }
        var newItemIds = [];
        if (newItems.length) {
            var Model_2 = _$6.get(newItems, '0.constructor');
            newItemIds = newItems.map(function (item) {
                invariant(item.constructor === Model_2, "splice only accept new item instance of " + _this.getType().name);
                return item.getKey();
            });
        }
        var deletedItems = (_a = this.items).splice.apply(_a, [startIndex, deleteCount].concat(newItemIds));
        this._doChange(deletedItems);
        return Collection.getInstance(this.Model, deletedItems);
        var _a;
    };
    /**
     * return a collection that is sorted by the given compareFn
     * @param iteratee: The iteratees to sort by
     */
    Collection.prototype.sortBy = function (iteratee) {
        var sortedItems = _$6.sortBy(this.all(), iteratee);
        return Collection.fromArray(sortedItems);
    };
    /**
     * return a collection that is sorted by the given compareFn
     * @param iteratee: The iteratees to sort by
     */
    Collection.prototype.orderBy = function (iteratee, orders) {
        var orderedItems = _$6.orderBy(this.all(), iteratee, orders);
        return Collection.fromArray(orderedItems);
    };
    /**
     * return size of the collection
     */
    Collection.prototype.size = function () {
        return this.items.length;
    };
    Collection.prototype._doChange = function (items) {
        var onChange = _$6.get(this.options, 'onChange');
        if (typeof onChange === 'function') {
            onChange(items);
        }
    };
    return Collection;
}());

var _$7 = require('lodash');
var Field = function (options) {
    if (options === void 0) { options = {}; }
    return function (target, property) {
        var defaultValue = _$7.get(options, 'defaultValue');
        var isRequired = _$7.get(options, 'required');
        // set definition for this field
        setDefinition(target.constructor, property, __assign({}, options, { name: 'Field', type: Field, ensureData: function (data, opt) {
                if (opt === void 0) { opt = {}; }
                var val = _$7.get(data, property, defaultValue);
                val = typeof val === 'function' ? val() : val;
                // check required
                invariant(!(isRequired && val === undefined), "Missing value for required field " + property);
                _$7.set(data, property, val);
            }, validation: function () {
            } }));
        Object.defineProperty(target, property, {
            get: function () {
                // setup property tracking if needed
                var store = getStore();
                var reactionContext = globalState.getReactionContext();
                if (reactionContext) {
                    var token = ModelMiddleware.tokenBuilder(this.getTableName(), this.getKey(), property);
                    reactionContext.track(token);
                }
                var propVal = store.get(this.getTableName(), this._id, property, defaultValue);
                return propVal;
            },
            set: function (newVal) {
                // @TODO: perform data validation for field
                this.update((_a = {}, _a[property] = { $set: newVal }, _a));
                return newVal;
                var _a;
            },
            enumerable: true,
            configurable: true
        });
    };
};

var _$9 = require('lodash');
var QueryRes = (function () {
    function QueryRes() {
    }
    return QueryRes;
}());
var dispatcher = function (table, action) {
    var type = action.type;
    var rtn = new QueryRes();
    var store = getStore();
    if (!store) {
        return rtn;
    }
    switch (type) {
        case ACTIONS.INSERT:
            rtn.changes = store.insert(table, _$9.get(action, 'data'));
            break;
        case ACTIONS.UPDATE:
            rtn.changes = store.update(table, _$9.get(action, '_id'), _$9.get(action, 'query'));
            break;
        case ACTIONS.DELETE:
            rtn.changes = store.delete(table, _$9.get(action, '_id'));
            break;
        case ACTIONS.QUERY:
            rtn.data = store.query(table, _$9.get(action, 'cond'), _$9.get(action, 'selection'));
            break;
        case ACTIONS.FIND:
            rtn.data = store.find(table, _$9.get(action, '_id'), _$9.get(action, 'selection'));
            break;
    }
    return rtn;
};
var Query = (function () {
    function Query(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this.actions = [];
    }
    Query.prototype.findById = function (id, selection) {
        this.actions.push({
            type: ACTIONS.FIND,
            _id: id,
        });
        return this;
    };
    Query.prototype.findOne = function () {
        return this;
    };
    Query.prototype.find = function (cond, selection) {
        this._resetAction();
        this.actions.push({
            type: ACTIONS.QUERY,
            cond: cond,
            selection: selection,
        });
        return this;
    };
    Query.prototype.insert = function (data) {
        //TODO: perform data validation base on Model schema here
        this._resetAction();
        this.actions.push({
            type: ACTIONS.INSERT,
            data: data,
        });
        return this;
    };
    Query.prototype.update = function (id, query) {
        this._resetAction();
        this.actions.push({
            type: ACTIONS.UPDATE,
            _id: id,
            query: query,
        });
        return this;
    };
    Query.prototype._resetAction = function () {
        this.actions = [];
    };
    Query.prototype.replace = function () {
    };
    Query.prototype.delete = function (id) {
        this._resetAction();
        this.actions.push({
            type: ACTIONS.DELETE,
            _id: id,
        });
        return this;
    };
    Query.prototype.run = function (cb) {
        var _this = this;
        var rtn;
        this.actions.map(function (action) {
            rtn = dispatcher(_this._getTableName(), action);
        });
        return rtn;
    };
    Query.prototype._getTableName = function () {
        return _$9.get(this.options, 'tableName');
    };
    return Query;
}());

var Connection = (function () {
    function Connection() {
    }
    Connection.table = function (tableName) {
        return new Query({ tableName: tableName });
    };
    return Connection;
}());

var _$8 = require('lodash');
var TableHookType;
(function (TableHookType) {
    TableHookType["BEFORE_INSERT"] = "beforeInsert";
    TableHookType["AFTER_INSERT"] = "afterInsert";
    TableHookType["BEFORE_DELETE"] = "beforeDelete";
    TableHookType["AFTER_DELETE"] = "afterDelete";
})(TableHookType || (TableHookType = {}));
var registerTable = function (target, options) {
    var _a = options, tableName = _a.tableName, _b = _a.keyName, keyName = _b === void 0 ? '_id' : _b, _c = _a.hooks, hooks = _c === void 0 ? [] : _c;
    var Model = target;
    Model.tableName = tableName;
    Model.keyName = keyName;
    setTableKey(tableName, keyName);
    /********** static methods **********/
    Model.getKeyName = function () {
        return keyName;
    };
    Model.getTableName = function () {
        return tableName;
    };
    Model.applyHook = function (name, args, thisArgs) {
        thisArgs = thisArgs || this;
        hooks.filter(function (hook) {
            if (_$8.get(hook, "type") === name) {
                var handler = _$8.get(hook, "handler");
                if (typeof handler === 'function') {
                    handler.apply(thisArgs, args);
                }
            }
        });
    };
    /********** prototype methods **********/
    Model.prototype.getKeyName = function () {
        return keyName;
    };
    Model.prototype.getTableName = function () {
        return tableName;
    };
    Model.prototype.applyHook = function (name, args) {
        Model.applyHook(name, args, this);
    };
};
var Table = function (options) {
    return function (target) {
        registerTable(target, options);
    };
};
var Model = (function () {
    function Model(_id) {
        this._id = _id;
    }
    Model.prototype.getKey = function () {
        return this._id;
    };
    Model.prototype.update = function (data) {
        Connection.table(this.getTableName()).update(this.getKey(), data).run();
    };
    Model.prototype.delete = function () {
        Connection.table(this.getTableName()).delete(this.getKey()).run();
    };
    Model.prototype.get = function (path, defaultValue) {
        return _$8.get(this, path, defaultValue);
    };
    Model.prototype.getHashKey = function (prop) {
        return prop === undefined ? this.getTableName() + "::" + this.getKey() : this.getTableName() + "::" + this.getKey() + "::" + prop;
    };
    Model._cacheModelInstances = new Map();
    Model.getInstance = function (_id) {
        var Model = this;
        if (!_id)
            return null;
        if (!this._cacheModelInstances.has(_id)) {
            this._cacheModelInstances.set(_id, new Model(_id));
        }
        return this._cacheModelInstances.get(_id);
    };
    Model.ensureData = function (data, options) {
        if (options === void 0) { options = {}; }
        // get list of field defined via schema
        var _data = __assign({}, data);
        var definitions = listDefinitions(this);
        definitions && definitions.forEach(function (definition, property) {
            var ensureData = definition.ensureData;
            if (typeof ensureData === 'function') {
                ensureData(_data, options);
            }
        });
        return _data;
    };
    Model.new = function (data) {
        return this.insert(data);
    };
    Model.insert = function (data, opt) {
        var insertData = this.ensureData(data);
        // hook
        this.applyHook(TableHookType.BEFORE_INSERT, [data, opt]);
        var res = Connection.table(this.getTableName()).insert(insertData).run();
        var changes = res.changes;
        var rtn;
        if (Array.isArray(changes) && changes.length) {
            var _id = _$8.get(changes, '0._id');
            rtn = this.getInstance(_id);
        }
        // hook
        this.applyHook(TableHookType.AFTER_INSERT, [data, opt, changes]);
        return rtn;
    };
    Model.findById = function (_id) {
        var Model = this;
        var query = Connection.table(Model.getTableName()).findById(_id, (_a = {}, _a[Model.getKeyName()] = true, _a)).run();
        var data = query.data;
        var rtn;
        var reactionContext = globalState.getReactionContext();
        if (reactionContext) {
            var token = ModelMiddleware.tokenBuilder(this.getTableName(), _id, Model.getKeyName());
            reactionContext.track(token);
        }
        if (data) {
            return this.getInstance(_id);
        }
        return rtn;
        var _a;
    };
    Model.findOne = function (cond) {
        return this.find(cond).first();
    };
    Model.find = function (cond, options) {
        if (options === void 0) { options = {}; }
        var Model = this;
        var valGetter = function () {
            // @TODO: memozie getter result if data is not changed
            var res = Connection.table(Model.getTableName()).find(cond, (_a = {}, _a[Model.getKeyName()] = true, _a)).run();
            return _$8.get(res, 'data').map(function (item) { return item[Model.getKeyName()]; });
            var _a;
        };
        return Collection.getInstance(Model, { resolver: valGetter });
    };
    return Model;
}());

var trackTrace = function (enable) {
    if (globalState._runningReaction) {
        globalState._runningReaction.trackTrace(!!enable);
    }
    else if (globalState._updatingReaction) {
        globalState._updatingReaction.trackTrace(!!enable);
    }
};

var transaction = function (worker) {
    var store = getStore();
    if (store && typeof worker === 'function') {
        store.startTransaction();
        worker();
        store.endTransaction();
    }
};

var whyRun = function () {
    if (globalState._updatingReaction) {
        globalState._updatingReaction.whyRun();
    }
};

var _$10 = require('lodash');
var hasOne = function (typeFunction, options) {
    if (options === void 0) { options = {}; }
    return function (target, property) {
        var ownerKey = _$10.get(options, 'ownerKey', property + "Id");
        // set definition for this field
        setDefinition(target.constructor, property, __assign({}, options, { name: 'hasOne', type: hasOne, ensureData: function (data, opt) {
                if (opt === void 0) { opt = {}; }
                var Model = typeFunction();
                var val = _$10.get(data, property);
                if (val instanceof Model) {
                    _$10.set(data, ownerKey, val.getKey());
                }
                delete data[property];
            }, validation: function () {
            } }));
        // define relation to property
        Object.defineProperty(target, property, {
            get: function () {
                var Model = typeFunction();
                var itemId = this.get(ownerKey);
                return Model.findById(itemId);
            },
            set: function (newVal) {
                var Model = typeFunction();
                var relationInstance = newVal instanceof Model ? newVal : Model.findById(newVal);
                this[ownerKey] = relationInstance ? relationInstance.getKey() : undefined;
                return this;
            },
            enumerable: true,
            configurable: true
        });
        // define ownerKey property
        Field(options)(target, ownerKey);
    };
};

var _$11 = require('lodash');
var hasMany = function (typeFunction, options) {
    if (options === void 0) { options = {}; }
    return function (target, property) {
        var ownerKey = _$11.get(options, 'ownerKey', property + "Ids");
        // set definition for this field
        setDefinition(target.constructor, property, __assign({}, options, { name: 'hasMany', type: hasMany, ensureData: function (data, opt) {
                if (opt === void 0) { opt = {}; }
                var Model = typeFunction();
                var val = _$11.get(data, property);
                if (Array.isArray(val)) {
                    val = Collection.fromArray(val);
                }
                if (val && val instanceof Collection && val.getType() === Model) {
                    _$11.set(data, ownerKey, val.keys());
                }
                delete data[property];
            }, validation: function () {
            } }));
        // define relation to property
        Object.defineProperty(target, property, {
            get: function () {
                var _this = this;
                var Model = typeFunction();
                return Collection.getInstance(Model, {
                    resolver: function () {
                        return _this.get(ownerKey, []);
                    },
                    onChange: function (items) {
                        _this[ownerKey] = items;
                    }
                });
            },
            set: function (items) {
                var Model = typeFunction();
                try {
                    var col = Collection.fromArray(items);
                    invariant(col.getType() === Model, "hasMany relation requires collection of \"" + Model.name + "\" while receives collection of \"" + col.getType().name + "\"");
                    this[ownerKey] = col.keys();
                    return this;
                }
                catch (err) {
                }
            },
            enumerable: true,
            configurable: true
        });
        // define ownerKey property
        Field(options)(target, ownerKey);
    };
};

var _$12 = require('lodash');
var belongsToMany = function (typeFunction, options) {
    if (options === void 0) { options = {}; }
    return function (target, property) {
        var foreignKey = _$12.get(options, 'foreignKey', property + "Id");
        var filter = _$12.get(options, 'filter', {});
        // set definition for this field
        setDefinition(target.constructor, property, __assign({}, options, { name: 'belongsToMany', type: belongsToMany, ensureData: function (data, opt) {
                if (opt === void 0) { opt = {}; }
                // const Model = typeFunction()                
                // let val = _.get(data, property)
                delete data[property];
            }, validation: function () {
            } }));
        // define relation to property
        Object.defineProperty(target, property, {
            get: function () {
                var Model = typeFunction();
                return Model.find(__assign({}, filter, (_a = {}, _a[foreignKey] = this.getKey(), _a)));
                var _a;
            },
            set: function (items) {
                var Model = typeFunction();
                try {
                    if (Array.isArray(items)) {
                        items = Collection.fromArray(items);
                    }
                    invariant(items.getType() === Model, "belongsToMany relation requires collection of \"" + Model.name + "\" while receives collection of \"" + items.getType().name + "\"");
                    return this;
                }
                catch (err) {
                }
            },
            enumerable: true,
            configurable: true
        });
    };
};

export { autorun, observer, Collection, setDefinition, getDefinition, listDefinitions, setTableKey, getTableKey, Field, TableHookType, Table, Model, trackTrace, transaction, whyRun, hasOne, hasMany, belongsToMany };
