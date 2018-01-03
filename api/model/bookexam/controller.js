const Controller = require('../../lib/controller');
const slackFacade = require('./facade');
const ReportExamFacade = require('../reportexam/facade');
const ExamFacade = require('../exam/facade');

class SlackController extends Controller {
  async createBooking(req, res, next) {
    console.log("Payload: ",req.body.payload); // don't delete yet
    const response = JSON.parse(req.body.payload);
    const studentId = response.user.name;
    const course = response.channel.name;
    const temp = response.actions[0].value.split('*', 2);
    const exam = temp[0];
    const timeSlotNumber = temp[1];

    try {
      let report = await ReportExamFacade.findOne({ studentId, course, exam });
      console.log("Logging report in book exam: ", report);
      if (!report) {
        return res.status(200).json({
          text: 'We couldn\'t find any build history on your examination. Please create a release of your application on GitHub before trying to book the exam.'
        });
      }

      if (report.buildOk) {
        let examDoc = await ExamFacade.findOne({ course: course, name: exam });
        console.log("Logging exam in book exam: ", examDoc);
        if (!examDoc) {
          return res.status(200).json({ text: "We couldn't find the specified exam" });
        }

        let current = examDoc.timeSlots[timeSlotNumber].timeSlot;
        if (current.studentId !== 'Available'){
            current.studentId = studentId;
            await examDoc.save();
        }else {
            res.status(200).json({text: 'I am sorry but that slot is already taken. Pick another.'});
        }

        return res.status(200).json(format(current));
      } else {
        res.status(200).json({text: 'The current build of the examination did not pass the given tests please fix these and try again'});
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({ text: 'Internal server error' });
    }
  }
}

function format(current) {
  return {
    text: `You have successfully booked a examination! With the studentId: ${current.studentId} in the time slot: <!date^${current.startTime}^{time} | 8.00 AM> - <!date^${current.endTime}^{time} |8.00 AM>`,
    attachments: []
  };
}

module.exports = new SlackController(slackFacade);
