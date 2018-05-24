const Facade = require('../../lib/facade');
const examSchema = require('../exam/schema');

class BookExamFacade extends Facade {}

module.exports = new BookExamFacade(examSchema);
