const Facade = require('../../lib/facade');
const examSchema = require('./schema');

class ExamFacade extends Facade {
  findOne(...args) {
    return this.Schema
      .findOne(...args)
      .populate('timeSlots')
      .exec();
  }
}

module.exports = new ExamFacade(examSchema);
