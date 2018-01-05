const Facade = require('../../lib/facade');
const userSchema = require('./schema');

class UserFacade extends Facade {
    createUser(info) {
        return userSchema.update({
            slackUser: info.slackUser,
        },
            {
                $set: {
                    lnu: info.lnu,
                    github: info.github,
                    slackUser: info.slackUser,
                }
            }, { upsert: true }).exec()
    }
}

module.exports = new UserFacade(userSchema);