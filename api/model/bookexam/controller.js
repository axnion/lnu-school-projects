const Controller = require('../../lib/controller');
const slackFacade = require('./facade');
const ReportExamFacade = require('../reportexam/facade');
const ExamFacade = require('../exam/facade');
const userFacade = require('../user/facade');

class SlackController extends Controller {
  async createBooking(req, res, next) {
    const response = JSON.parse(req.body.payload);
    let studentId = response.user.name;
    const course = response.channel.name;
    const temp = response.actions[0].value.split('*', 2);
    const exam = temp[0];
    const timeSlotNumber = temp[1];
    //TODO What to do if a student books two times ? Update and set the new time or reject ?
    try {

      const user = await userFacade.findOne({ slackUser: studentId });
      if (!user) {
        return res.status(200).json({ text: "Please register your user before trying to book a exam." });
      }
      studentId = user.lnu;

      let report = await ReportExamFacade.findOne({ studentId, course, exam });
      if (!report) {
        return res.status(200).json({
          text: 'We couldn\'t find any build history on your examination. Please create a release of your application on GitHub before trying to book the exam.'
        });
      }

      if (report.buildOk) {
        let examDoc = await ExamFacade.findOne({ course: course, name: exam })

        if (!examDoc) {
          return res.status(200).json({ text: "We couldn't find the specified exam" });
        }
        console.log(examDoc);
        let current = examDoc.timeSlots[timeSlotNumber].timeSlot;
        if (current.studentId === 'Available') {
          // Remove find and remove and student id from the array when match is found.
          current.studentId = report.studentId;

          await examDoc.save();
        } else {
          return res.status(200).json({ text: 'I am sorry but that slot is already taken. Pick another.' });
        }

        return res.status(200).json(format(current));
      } else {
        res.status(200).json({ text: 'The current build of the examination did not pass the given tests please fix these and try again' });
      }
    } catch (e) {
      return res.status(500).json({ text: 'Internal server error' });
    }
  }
}

function format(current) {
  return {
    text: "You have successfully booked a examination! With the studentId: " + current.studentId + " in the time slot: " +
      "<!date^" + current.startTime.valueOf() / 1000 + "^ {time}| 8.00 AM> - <!date^" + current.endTime.valueOf() / 1000 + "^ {time}| 8.00 AM>",
    attachments: []
  };
}

module.exports = new SlackController(slackFacade);
