import "reflect-metadata"

const metaKey = 'relations:spec'
export const setDefinition = (target, property, relation) => {
    if(!Reflect.hasMetadata(metaKey, target)) {
        Reflect.metadata(metaKey, new Map())(target)
    }
    Reflect.getMetadata(metaKey, target).set(property, relation)
}

export const getDefinition = (target, property) => {
    if(Reflect.hasMetadata(metaKey, target)) {
        return Reflect.getMetadata(metaKey, target).get(property)
    }
}

export const listDefinitions = (target) => {
    if(Reflect.hasMetadata(metaKey, target)) {
        return Reflect.getMetadata(metaKey, target)
    }
}

const _tableKeys = new Map()

export const setEntityKey = (table, keyName) => {
    _tableKeys.set(table, keyName)
}

export const getEntityKey = (table) => {
    return _tableKeys.get(table)
}