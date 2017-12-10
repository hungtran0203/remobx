export declare type FieldOptions = {
    validation?: Function | object;
    defaultValue?: any;
    isRequired?: string | boolean;
};
export declare const Column: (options?: FieldOptions) => (target: any, property: any) => void;
