import "reflect-metadata"

export const defineRelation = (target, property, relation) => {
    const metaKey = 'relations:spec'
    if(!Reflect.hasMetadata(metaKey, target)) {
        Reflect.metadata(metaKey, new Map())(target)
    }
    Reflect.getMetadata(metaKey, target).set(property, relation)
}
