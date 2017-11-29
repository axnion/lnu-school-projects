const Controller = require('../../lib/controller');
const slackFacade = require('./facade');

class SlackController extends Controller {}

module.exports = new SlackController(slackFacade);
