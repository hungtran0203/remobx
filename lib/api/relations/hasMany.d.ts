export declare type hasManyOptions = {
    ownerKey?: string;
    validation?: Function | object;
};
export declare const hasMany: (typeFunction: Function, options?: hasManyOptions) => (target: any, property: any) => void;
