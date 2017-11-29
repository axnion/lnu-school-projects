const Facade = require('../../lib/facade');
const reportExamSchema = require('./schema');

class ReportExamFacade extends Facade {
  createExamReport(body) {
    const schema = new this.Schema({
      course: body.course,
      studentId: body.studentId,
      buildOk: body.buildOk,
      exam: body.exam
    });

    return schema.save();
  }
}

module.exports = new ReportExamFacade(reportExamSchema);
