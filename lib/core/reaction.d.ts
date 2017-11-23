export declare class Reaction {
    reactionRunner: any;
    static store: WeakMap<object, any>;
    trackObjects: Map<any, any>;
    private disposers;
    private _runReasons;
    private _trackTrace;
    private _isUpdating;
    _id: number;
    private _v;
    constructor(reactionRunner: any);
    run(): void;
    whyRun(): void;
    addRunReason(reason: any): void;
    trackTrace(enable: any): void;
    isTrackEnabled(): boolean;
    getVersion(): number;
    update(): void;
    track(token: any): void;
    hasTrack(obj: any, prop: any): any;
    dispose: () => void;
    getHashKey(): number;
}
