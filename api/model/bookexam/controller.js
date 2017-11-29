const Controller = require('../../lib/controller');
const slackFacade = require('./facade');
const reportExamController = require('../reportexam/controller');

class SlackController extends Controller {
  createBooking(req, res, next) {
    // get available exams
    // course
    // id
    // buildOk
    // exam - typ namn på repot fw222ek-examination...

    console.log(req.body.payload);

    let response = JSON.parse(req.body.payload);
    console.log(response.user.name);
    const username = response.user.name;
    const courseName = response.channel.name;

    res.status(200).json({
      Hej: 'ho'
    });
  }
}

module.exports = new SlackController(slackFacade);
