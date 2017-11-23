export declare type hasOneOptions = {
    ownerKey?: string;
    validation?: Function | object;
};
export declare const hasOne: (typeFunction: Function, options?: hasOneOptions) => (target: any, property: any) => void;
