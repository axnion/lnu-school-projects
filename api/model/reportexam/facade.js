const Facade = require('../../lib/facade');
const reportExamSchema = require('./schema');

class ReportExamFacade extends Facade {
  createExamReport(body) {
    return reportExamSchema.update({
            course: body.course,
            studentId: body.studentId,
            exam: body.exam,
        },
        {$set: {
                course: body.course,
                studentId: body.studentId,
                buildOk: body.buildOk,
                exam: body.exam
            }}, { upsert: true}).exec()
  }
}

module.exports = new ReportExamFacade(reportExamSchema);