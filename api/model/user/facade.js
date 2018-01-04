const Facade = require('../../lib/facade');
const userSchema = require('./schema');

class UserFacade extends Facade {
    createUser(info) {

        // TODO: Fix function so possible to add nmew users
        return userSchema.update({
            lnu: info.lnu,
            github: info.github,
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