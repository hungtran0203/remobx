import * as _ from 'lodash'

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