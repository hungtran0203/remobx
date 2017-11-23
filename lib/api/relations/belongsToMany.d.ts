export declare type belongsToManyOptions = {
    foreignKey?: string;
    filter?: object;
    validation?: Function | object;
};
export declare const belongsToMany: (typeFunction: Function, options?: belongsToManyOptions) => (target: any, property: any) => void;
