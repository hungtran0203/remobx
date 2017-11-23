export declare const isObject: (val: any) => boolean;
export declare function isPlainObject(o: any): boolean;
export declare function getTypeOf(value: any): "string" | "number" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array" | "plain" | "null";
export declare const select: (object: any, proj: any) => {};
export declare const traverse: (obj: Object, cb: (path: string, field: string, value: any) => void, path?: string) => void;
export declare const visit: (obj: Object, cb: (path: string, field: string, value: any) => void, path?: string) => void;
export declare const getHashKey: (obj: any) => string;
