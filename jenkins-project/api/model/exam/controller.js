const Controller = require('../../lib/controller');
const examFacade = require('./facade');
const userFacade = require('../user/facade');
const isSlackAdmin = require('../../lib/isSlackAdmin');
const token = process.env.SLACK_API_TOKEN;
const request = require('request');
const rp = require('request-promise');
const URL = process.env.URL;
//const reportToSlack = require('../../lib/reportToSlack');
let testsUrl;

class ExamController extends Controller {
  // /createexamtest {"date": "2017-12-30", "name": "exam", "duration": 30, "timeSlots": 20, "examiners": 3}

  createExam(req, res, next) {
      isSlackAdmin(token, req.body.user_id).then(isAdmin => {
          if (!isAdmin) {
              return res.status(200).json({"text": "Only admins can create exams"});
          }else {
              this.authToCreateExam(req, res, next);
          }
      }).catch(err => {
          console.log(err);
          res.status(205).json({text: "There was an error while checking for slack admin."});
      });
  }

  authToCreateExam(req, res, next) {
    let input;

    try {
      input = JSON.parse(req.body.text, (key, value) => {
        return value;
      });
    } catch (e) {
      return res.status(205).json({ text: "Could not parse the given input." })
    }

    const timeTable = buildTimeTable(input.duration, input.date, input.timeSlots);

    let exam = {
      course: req.body.channel_name,
      date: new Date('<' + input.date + '>'),
      name: input.name,
      examiners: input.examiners,
      testsUrl: input.testsurl,
      timeSlots: []
    };

    /// om ny dag händer
    for (let i = 0; i < timeTable.length; i++) {
      if (timeTable[i] === 'skip' || timeTable[i + 1] === 'skip') {
        continue;
      }
      for (let j = 0; j < input.examiners; j++) {
        if (i + 1 < timeTable.length) {
          exam.timeSlots.push({
            timeSlot: {
              duration: input.duration,
              studentId: 'Available',
              startTime: timeTable[i],
              endTime: timeTable[i + 1]
            }
          });
        }
      }
    }

    this.facade
      .create(exam)
      .then(doc => res.status(201).json(format(doc)))
      .catch(err => {
        console.log(err);
        res.status(205).json({ text: "There was an error while creating the exam." });
      });
  }


  getExam(req, res, next) {
    const inputDate = new Date(Date.now());
    this.facade
      .findOne({ course: req.body.channel_name, date: { $gte: inputDate } })
      .then(doc => res.status(200).json(format(doc)))
      .catch(err => {
        console.log(err);
        res.status(205).json({ text: "There was an error while looking for the exam." });
      });
  }

  /**
   * Returns the time of an exam booking if it exists, or informs the user that there is no booking if none has been made
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getMyExam(req, res, next) {
    const { user_name, channel_name } = req.body;
    const user = await userFacade.findOne({ slackUser: user_name });

    const doc = await examFacade.findOne({ course: channel_name, date: { $gte: Date.now() } }, { timeSlots: { $elemMatch: { 'timeSlot.studentId': user ? user.lnu : "" } } });
    let responseText;
    if (doc !== null) {
      responseText = (doc.timeSlots.length > 0) ? `${user.lnu} has booked exam at <!date^${doc.timeSlots[0].timeSlot.startTime.valueOf() / 1000}^{date} {time} | 8.00 AM>` : 'No exam time was booked';
    } else {
      responseText = 'No exam found';
    }

    return res.status(200).json({ text: responseText });
  }

  async buildExam(req, res, next) {
    const input = req.body.repository;
    let info = {
      repoName: input.name,
      cloneUrl: input.clone_url,
      courseName: input.owner.name,
      githubId: req.body.sender.login,
      studentId: "",
      examName: input.name.split('-')[1] + '-' + input.name.split('-')[2]
    };

    let exam = await examFacade.findOne({ course: info.courseName, name: info.examName });

    if (!exam) {
      return res.status(404).json("Couldn't find the exam specified");
      //reportToSlack("ab223sq", "shitsOnFireYo")
    }

    testsUrl = exam.testsUrl;

    const user = await userFacade.findOne({ github: info.githubId });
    if (!user) {
      return res.status(404).json("Couldn't find the user specified");
      //reportToSlack("ab223sq", "shitsOnFireYo")
    }
    info.studentId = user.slackUser;

    await request.get(
      'http://194.47.174.64:8000/job/buildRandomRepo/buildWithParameters?token=superSecretToken&giturl=' + info.cloneUrl
      + '&studentId=' + info.studentId + '&testsurl=' + testsUrl + '&course=' + info.courseName + '&exam=' + info.examName + '&apiurl=' + URL + '/reportexam',
      async function (error, response, body) {
        if (response.statusCode === 201) {
          await reportToSlack(`%23${info.courseName}`, `%40${user.slackUser}`, "Jenkins is happily eating your code. A build result should be available shortly");
        } else {
          await reportToSlack(`%23${info.courseName}`, `%40${user.slackUser}`, "Something went wrong while attempting to trigger building with Jenkins");
        }
      }
    );
    return res.status(200).json('Ok');
  }
}

function format(examDoc) {
  if (examDoc === null) {
    return {
      text: 'There does not seem to be any exams for this course :smile:'
    };
  }
  let formated = {
    text: `${examDoc.name} for the course: ${examDoc.course} on <!date^${examDoc.date.valueOf() / 1000}^ {date_pretty}| 2014-02-18 6:39:42 AM>`,
    attachments: []
  };

  for (let i = 0; i < examDoc.timeSlots.length - 1; i++) {
    let current = examDoc.timeSlots[i].timeSlot;
    let startTime = current.startTime.valueOf() / 1000;
    let endTime = current.endTime.valueOf() / 1000;
    formated.attachments.push({
      fallback: `<!date^${startTime}^{time} | 8.00 AM> - <!date^${endTime}^{time} |8.00 AM>`,
      title: `<!date^${startTime}^{time} | 8.00 AM> - <!date^${endTime}^{time} |8.00 AM>`,
      callback_id: 'comic_1234_xyz',
      color: '#3AA3E3',
      attachment_type: 'default',
      actions: [
      ]
    });
    for (let j = 0; j < examDoc.examiners; j++) {
      let l = i + j;
      formated.attachments[formated.attachments.length - 1].actions.push({
        name: 'book',
        text: `Slot ${j + 1}: ${examDoc.timeSlots[l].timeSlot.studentId}`,
        type: 'button',
        value: examDoc.name + '*' + l
      });

      if (j === examDoc.examiners - 1)
        i += j;
    }

  }

  return formated;
}

function buildTimeTable(duration, date, timeSlots) {
  let table = [];

  //Create date and set it to 8 am CET
  date = new Date(date);
  date = addMinutes(date, 420);
  let maxDate = addMinutes(date, 540);

  table.push(date);

  while (date < maxDate && table.length <= timeSlots) {
    date = addMinutes(date, duration);
    table.push(date);
    if (addMinutes(date, duration) > maxDate && table.length <= timeSlots) {
      table.push('skip');

      date = addMinutes(date, duration);
      table.push(date);

      date.setDate(date.getDate() + 1);
      date.setTime(date.getTime() - 570 * 60000);

      maxDate.setDate(maxDate.getDate() + 1);
    }
  }

  return table;
}

async function reportToSlack(channelName, slackUser, message) {
  const options = {
    method: 'GET',
    uri: `https://slack.com/api/chat.postMessage?token=xoxp-273720381861-272957369408-294957226822-bb7917d088c058e70600b89f9d0617e8&channel=${slackUser}&text=${message}&pretty=1`,
  };

    if (process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "production") {
        await rp(options).then(resp => {
            const res = JSON.parse(resp);
            if (!res.ok) {
                reportToSlack(channelName, channelName, `Oh nooooo! Something went wrong while sending a message to ${slackUser} about their Jenkins build.`);
            }
            return res;
        })
            .catch(err => err);
    }
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

module.exports = new ExamController(examFacade);
