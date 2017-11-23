export declare type FieldOptions = {
    validation?: Function | object;
    defaultValue?: any;
    isRequired?: string | boolean;
};
export declare const Field: (options?: FieldOptions) => (target: any, property: any) => void;
