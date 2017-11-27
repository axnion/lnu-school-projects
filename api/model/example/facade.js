const Facade = require('../../lib/facade');
const exampleSchema = require('./schema');

class ExampleFacade extends Facade {}

module.exports = new ExampleFacade(exampleSchema);
