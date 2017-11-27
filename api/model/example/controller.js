const Controller = require('../../lib/controller');
const exampleFacade = require('./facade');

class ExampleController extends Controller {}

module.exports = new ExampleController(exampleFacade);
