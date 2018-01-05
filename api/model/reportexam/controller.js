const Controller = require('../../lib/controller');
const reportExamFacade = require('./facade');

class ReportExamController extends Controller {
  createExamReport(req, res, next) {

    // unnecessary if - only for testing purposes
    if (req.body.buildOk) {
      console.log('It is ok');
    }
    //TODO: Report to slack use that build failed/was successful
    reportExamFacade
      .createExamReport(req.body)
      .then(resp => {
        console.log("Printing out the report exam in reportExamController",resp);
        return res.status(201).json({
          message: 'okdidoki'
        });
      })
      .catch(err => next(err));
  }
}

module.exports = new ReportExamController(reportExamFacade);