import globalState from './globalstate'
import {getStore} from './store'

let _auto_incr_id = 0
export class Reaction {
    static store = new WeakMap()
    public trackObjects = new Map()
    private disposers = new Map()
    private _runReasons = []
    private _trackTrace = false
    private _isUpdating = false
    public _id = 0
    private _v = 0
    constructor(public reactionRunner) {
        this._id = ++_auto_incr_id
    }

    public run() {
        if(typeof this.reactionRunner === 'function') {
            this.reactionRunner()
        }
    }

    public whyRun() {
        console.log(`[whyRun] _v=${this.getVersion()}`, this._runReasons)
    }

    public addRunReason(reason) {
        this._runReasons.push(reason)
    }

    public trackTrace(enable) {
        this._trackTrace = !!enable
    }

    public isTrackEnabled() {
        return !!this._trackTrace
    }

    public getVersion() {
        return this._v
    }

    public update() {
        try {
            globalState.pushReaction(this)
            this._isUpdating = true
            this._v ++
            globalState.isProfilingEnable(2) && console.log(`updating reaction@${this.getHashKey()} - v: ${this.getVersion()}`)
            this.run()
        }
        finally {
            globalState.popReaction()
            this._isUpdating = false
        }
    }

    public track(token) {
        const store = getStore()
        const disposer = store.subscribe(token, this)
        this.disposers.set(token, disposer)
    }

    public hasTrack(obj, prop) {
        return this.trackObjects.has(obj) && this.trackObjects.get(obj).has(prop)
    }

    public dispose = () => {
        this.disposers.forEach(disposer => {
            disposer()
        })
    }

    public getHashKey() {
        return this._id
    }
}
