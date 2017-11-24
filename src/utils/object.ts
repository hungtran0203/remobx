let _ = require('lodash')

export const isObject = (val) => {
    return (typeof val === 'object') && val !== null && !Array.isArray(val)
}

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

export function isPlainObject(o) {
    var ctor,prot

    if (isObjectObject(o) === false) return false

    // If has modified constructor
    ctor = o.constructor
    if (typeof ctor !== 'function') return false

    // If has modified prototype
    prot = ctor.prototype
    if (isObjectObject(prot) === false) return false

    // If constructor does not have an Object-specific method
    if (prot.hasOwnProperty('isPrototypeOf') === false) {
        return false
    }

    // Most likely a plain Object
    return true
}

export function getTypeOf(value) {
    let type = typeof value
    // return more detail about object type
    if(type === 'object') {
        if(Array.isArray(value)) {
            return 'array'
        }
        else if(isPlainObject(value)) {
            return 'plain'
        }
    }
    else if(value === null) {
        return 'null'
    }
    return type
}

export const select = (object, proj) => {
    const rtn = {}
    visit(proj, (path, field, value) => {
        if(value === true || value === 1) {
            _.set(rtn, path, _.get(object, path))            
        }
        return true
    })
    return rtn
}

export const traverse = (obj: Object, cb: (path: string, field: string, value: any) => void, path='') => {
    Object.keys(obj).map(key => {
        const field = key
        const subPath = path ? `${path}.${field}` : field
        if(cb(subPath, field, obj[key])) {
            traverse(obj[key], cb, subPath)
        }
    })
}

export const visit = traverse

export const getHashKey = (obj) => {
    let hash = []
    Object.keys(obj).map(key => {
        const val = obj[key]
        let hashVal
        switch(getTypeOf(val)) {
            case 'object':
                hashVal = typeof val['getHashKey'] === 'function' ? val.getHashKey() : 'object'
                break
            case 'array':
                hashVal = 'array'
                break
            case 'plain':
                hashVal = 'plain'
                break
            case 'null':
            default:
                hashVal = val
        }
        hash.push(`${key}=${hashVal}`)
    })
    hash.sort()
    return hash.join(';')
}
