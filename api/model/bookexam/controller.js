const Controller = require('../../lib/controller');
const slackFacade = require('./facade');
const reportExamController = require('../reportexam/controller');
const ReportExamFacade = require('../reportexam/facade');
const ExamFacade = require('../exam/facade');

class SlackController extends Controller {
  async createBooking(req, res, next) {
    console.log(req.body.payload); // don't delete yet
    const response = JSON.parse(req.body.payload);
    const studentId = response.user.name;
    const course = response.channel.name;
    const temp = response.actions[0].value.split('*', 2);
    const exam = temp[0];
    const timeSlotNumber = temp[1];

    try {
      // let report = await ReportExamFacade.findOne({ studentId, course, exam });
      let report = {};
      report.buildOk = true;
      console.log(report);
      if (!report) {
        return res.status(200).json({
          text: 'We couldn\'t find any build history on your examination. Please create a release of your application on GitHub before trying to book the exam.'
        });
      }



      if (report.buildOk) {
        let examDoc = await ExamFacade.findOne({ course: course, name: exam });

        if (!examDoc) {
          return res
            .status(200)
            .json({ text: "We couldn't find the specified exam" });
        }

        // TODO: check if timeslot already filled 
        // TODO: Tilldela rätt timeslot om det finns flera samtidigt
        examDoc.timeSlots[timeSlotNumber].timeSlot.studentId = studentId;
        console.log(examDoc.timeSlots[timeSlotNumber]);
        await examDoc.save();
        console.log(examDoc.timeSlots[timeSlotNumber]);

        return res.status(200).json(format(report));
      } else {
        // build failed, return appropriate message
        res.status(200).json({
          text: 'Build failed'
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({ text: 'Internal server error' });
    }
  }
}

// TODO: implement even more  meaningful response
function format(examDoc) {
  const formated = {
    text: 'This is a meaningful response',
    attachments: []
  };

  return formated;
}

module.exports = new SlackController(slackFacade);
