const Controller = require('../../lib/controller');
const reportExamFacade = require('./facade');
const rp = require('request-promise')
// const reportToSlack = require('../../lib/reportToSlack');

class ReportExamController extends Controller {
  createExamReport(req, res, next) {
    const { buildOk } = req.body;

    reportExamFacade
      .createExamReport(req.body)
      .then(resp => {

        const message = (buildOk == "true") ? "The build passed the tests! Register for exam with the \/bookexam command" : "The build failed some test. Correct the errors and make a new release";

        if (process.env.NODE_ENV == "dev" || process.env.NODE_ENV == "production") {
          reportToSlack(`%23${req.body.course}`, `%40${req.body.studentId}`, message);
        }


        return res.status(201).json({
          message
        });
      })
      .catch(err => {
          console.log(err);
          res.status(500).json("There was an error while creating the exam report");
      });
  }
}

async function reportToSlack(channelName, slackUser, message) {
  const options = {
    method: 'GET',
    uri: `https://slack.com/api/chat.postMessage?token=xoxp-273720381861-272957369408-294957226822-bb7917d088c058e70600b89f9d0617e8&channel=${slackUser}&text=${message}&pretty=1`,
  };

  await rp(options).then(resp => {
    const res = JSON.parse(resp);
    if (!res.ok) {
      reportToSlack(channelName, channelName, `Oh nooooo! Something went wrong while sending a message to ${slackUser} about their Jenkins build.`);
    }
    return res;
  })
    .catch(err => err);
}

module.exports = new ReportExamController(reportExamFacade);