import globalState from './globalstate'

export class Reaction {
    static store = new WeakMap()
    public trackObjects = new Map()
    private disposers = new Map()
    private _runReasons = []
    private _trackTrace = false
    private _isUpdating = false
    constructor(public reactionRunner) {
    }

    public run() {
        if(typeof this.reactionRunner === 'function') {
            this.reactionRunner()
        }
    }

    public whyRun() {
        console.log('[whyRun]', this._runReasons)
    }

    public trackTrace(val) {
        this._trackTrace = !!val
    }

    public update() {
        try {
            globalState._updatingReaction = this
            this._isUpdating = true
            this.run()    
        }
        finally {
            globalState._updatingReaction = undefined
            this._isUpdating = false
        }
    }

    public track(obj, prop) {
        if(!this.trackObjects.has(obj)) {
            // init obj tracking
            this.trackObjects.set(obj, new Set())
            // tracking model prop
            // if(obj && obj instanceof Model) {
            //     // create store subscribe token
            //     const token = {table: obj.getTableName(), _id: obj.getKey()}
            //     const disposer = firebase.subscribe(SUBSCRIBE_TYPES.MODEL, token, (change) => {
            //         const trackProps = this.trackObjects.get(obj)
            //         let shouldUpdate = false
            //         let runReasons = []
            //         trackProps.forEach(prop => {
            //             const isChanged = isChangedProp(obj, prop) as any
            //             if(isChanged) {
            //                 // update track val
            //                 runReasons.push({
            //                     prop,
            //                     ...isChanged,
            //                     target: obj,
            //                 })
            //                 shouldUpdate = true
            //             }
            //         })
            //         if(shouldUpdate) {
            //             this._runReasons = runReasons
            //             this.update()
            //         }
            //     })
            //     this.disposers.set(obj, disposer)
            // }
        }

        // check for track trace
        if(this._trackTrace) {
            console.log(`[trackTrace] tracking@${this._isUpdating ? 'update' : 'init'}`, prop, obj)
        }
        const trackProps = this.trackObjects.get(obj)
        // add tracking prop to target model
        trackProps.add(prop)
    }

    public hasTrack(model, prop) {
        return this.trackObjects.has(model) && this.trackObjects.get(model).has(prop)
    }

    public dispose = () => {
        this.disposers.forEach(disposer => {
            disposer()
        })
    }
}
