const Facade = require('../../lib/facade');
const examSchema = require('./schema');

class ExamFacade extends Facade {}

module.exports = new ExamFacade(examSchema);
