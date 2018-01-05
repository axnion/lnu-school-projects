const Controller = require('../../lib/controller');
const reportExamFacade = require('./facade');

class ReportExamController extends Controller {
  createExamReport(req, res, next) {

    // unnecessary if - only for testing purposes
    if (req.body.buildOk) {
        //TODO: Report to slack use that build failed/was successful
      console.log('It is ok');
    }

    reportExamFacade
      .createExamReport(req.body)
      .then(resp => {
        return res.status(201).json({
          message: 'okdidoki'
        });
      })
      .catch(err => next(err));
  }
}

module.exports = new ReportExamController(reportExamFacade);