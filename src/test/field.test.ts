import {autorun, Field, Model, Table} from '../remobx'

@Table({
    tableName: 'states',
})
export default class State extends Model {
    @Field()
    public name

    @Field({})
    public value
}

it('test', () => {
    autorun(() => {
        const qrData = State.findOne({name: 'qrData'})
        if(qrData) {
            `abcd: ${qrData.value}`
        }
        
    })
    let qrData = State.findOne({name: 'qrData'})
    if(!qrData) {
        qrData = State.insert({name: 'qrData'})
    }
    qrData.value = {x: 1}

})