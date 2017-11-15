export default class FireBase {
    constructor(private subs={}) {

    }

    public subscribe(type, token, target) {
        if(this.subs[type]) {
            return this.subs[type].subscribe(token, target)
        }
    }

    public dispatch(change) {
        Object.keys(this.subs).map(subsType => {
            this.subs[subsType].dispatch(change)
        })
    }
}
