const Facade = require('../../lib/facade');
const slackSchema = require('./schema');

class SlackFacade extends Facade {}

module.exports = new SlackFacade(slackSchema);
