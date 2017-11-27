const Controller = require('../../lib/controller');
const examFacade = require('./facade');

class ExamController extends Controller {}

module.exports = new ExamController(examFacade);
