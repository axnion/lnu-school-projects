const Controller = require('../../lib/controller');
const slackFacade = require('./facade');
const reportExamController = require('../reportexam/controller');
const ReportExamFacade = require('../reportexam/facade');

class SlackController extends Controller {
  createBooking(req, res, next) {
    console.log(req.body.payload); // don't delete yet
    console.log(req.body);
    const response = JSON.parse(req.body.payload);
    const studentId = response.user.name;
    const course = response.channel.name;
    // TODO: add exam

    ReportExamFacade.findOne({ studentId, course /* plus exam */ })
      .then(resp => {
        console.log(resp);
        if (!resp){
          return res.status(200).json({text: 'Coudnt find an exam so its fine'})
        }
        if (resp.buildOk) {
          // build was ok, make reservation
          return res.status(200).json(format(resp));
        } else {
          // build failed, return appropriate message
          res.status(200).json({
            text: 'Nope'
          });
        }
      })
      .catch(err => console.log(err));
  }
}

function format(examDoc) {
  console.log(examDoc);
  const formated = {
    text: 'This is a meaningful response',
    attachments: []
  };

  return formated;
}

module.exports = new SlackController(slackFacade);
