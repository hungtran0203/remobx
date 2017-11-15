import ChangeToken from '../changeToken'

export default class ModelTokenParser {
    protected data = {}
    private subscribers = new Map()
    public subscribe(token, reaction) {
        const tokenKey = this.serializeToken(token)
        if(!this.subscribers.has(tokenKey)) {
            this.subscribers.set(tokenKey, new Set())
        }
        const tokenSubscribers = this.subscribers.get(tokenKey)
        tokenSubscribers.add(reaction)
        return () => {
            tokenSubscribers.delete(reaction)
        }
    }

    public dispatch(change: ChangeToken) {
        const tokenKey = this.serializeToken(change)
        const tokenSubscribers = this.subscribers.get(tokenKey)
        const rtn = []
        if(tokenSubscribers) {
            tokenSubscribers.forEach(reaction => {
                rtn.push(reaction)
            })
        }
        return rtn
    }

    private serializeToken(token) {
        return `${token.table}::${token._id}`
    }
}
