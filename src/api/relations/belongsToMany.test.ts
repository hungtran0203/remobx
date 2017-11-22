import {autorun} from '../autorun'
import {transaction} from '../transaction'
import {Model, Table} from '../model'
import {Field} from '../field'
import {belongsToMany} from './belongsToMany'
import {hasOne} from './hasOne'

@Table({
    tableName: 'users',
})
class User extends Model {
    @Field()
    public name

    @belongsToMany(() => UserTeam, {foreignKey: 'userId'})
    public teams
}

@Table({
    tableName: 'teams',
})
class Team extends Model {
    @Field()
    public name

    @belongsToMany(() => UserTeam, {foreignKey: 'teamId'})
    public members
}

@Table({
    tableName: 'user_team',
})
class UserTeam extends Model {
    @hasOne(() => User)
    public user

    @hasOne(() => Team)
    public team

    @Field({defaultValue: Date.now})
    public joinedAt

    @Field({defaultValue: 'registered'})
    public role

}


it('belongsToMany relation', () => {
    Team.ensureData({name: 'team3'})

    const team1 = Team.insert({name: 'team1'})
    const team2 = Team.insert({name: 'team2'})

    const user1 = User.insert({name: 'user1'})
    const user2 = User.insert({name: 'user2'})
    const user3 = User.insert({name: 'user3'})

    UserTeam.insert({user: user1, team: team1})
    UserTeam.insert({user: user2, team: team1})
    UserTeam.insert({user: user3, team: team2, role: 'admin'})
    
    autorun(() => {
        console.log('autorun')
        console.log('lllll', team1.name)
        console.log(team1.members.size())
        console.log(team1.members.first().role, 'hamamama')
        
    })

    transaction(() => {
        // team1.members.first().role = 'admin'
        team1.members.push({user: user3, role: 'registered', joinedAt: Date.now()})
        // item.comments = comments
        // item.comments.push(CommentModel.insert({text: 'comment'}))
        // item.comments.push(CommentModel.insert({text: 'comment4'}))
        // item.comments.pop()
        // item.comments.shift()
    })

    // comments[0].text = 'new text'
})