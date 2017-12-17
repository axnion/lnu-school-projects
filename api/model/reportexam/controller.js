const Controller = require('../../lib/controller');
const reportExamFacade = require('./facade');

class ReportExamController extends Controller {
  createExamReport(req, res, next) {
    console.log(req.body);
    console.log(req.params);

    // unnecessary if - only for testing purposes
    if (req.body.buildOk) {
      console.log('It is ok');
    }

    reportExamFacade
      .createExamReport(req.body)
      .then(resp => {
        console.log(resp);
        return res.status(201).json({
          message: 'okdidoki'
        });
      })
      .catch(err => next(err));

    //return res.status(200).json({ message: 'Ok' });
  }
}

module.exports = new ReportExamController(reportExamFacade);