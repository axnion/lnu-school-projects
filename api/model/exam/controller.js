const Controller = require('../../lib/controller');
const examFacade = require('./facade');
const userFacade = require('../user/facade');
const request = require('request');
const URL = process.env.URL;
let testsUrl = "https://github.com/tommykronstal/getadockerfile";

class ExamController extends Controller {
  /// createexamtest {"date": "2017-12-30", "name": "exam", "duration": 30, "timeSlots": 20, "examiners": 3}
  createExam(req, res, next) {
    console.log(req);
    //TODO: check if user is admin when creating a exam
    const input = JSON.parse(req.body.text, (key, value) => {
      return value;
    });

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
      .catch(err => next(err));
  }

  getExam(req, res, next) {
    const inputDate = new Date(Date.now());
    this.facade
      .findOne({ course: req.body.channel_name, date: { $gte: inputDate } })
      .then(doc => res.status(200).json(format(doc)))
      .catch(err => next(err));
  }

  getMyExam(req, res, next) {
    const { user_name, channel_name } = req.body;

    // ref till findOne
    // { results: { $elemMatch: { $gte: 80, $lt: 85 } } }
    examFacade.findOne({ course: channel_name, date: { $gte: Date.now() } }, { timeSlots: { $elemMatch: { 'timeSlot.studentId': user_name } } }).then(doc => {
      console.log(doc.timeSlots);

      const responseText = (doc.timeSlots.length > 0) ? `${user_name} has booked exam at ${doc.timeSlots[0].timeSlot.startTime}` : 'No exam time was booked';

      return res.status(200).json({ text: responseText });
    })
      .catch(err => next(err));
  }

  buildExam(req, res, next) {
    const input = req.body.repository;
    let info = {
      repoName: input.name,
      cloneUrl: input.clone_url,
      courseName: input.owner.name,
      githubId: req.body.sender.login,
      studentId: "",
      examName: input.name.split('-')[1] + '-' + input.name.split('-')[2]
    };
    console.log(info);

    // Get testsurl from DB here?
    examFacade
      .findOne({course: info.courseName, name: info.examName})
      .then(doc => {
        testsUrl = doc.testsUrl;
      }).catch(e => {
        // Did not find any testsurl
      });

    userFacade.findOne({github: info.githubId}).then(doc => {
        info.studentId = doc.lnu;
    });

    request.get(
      'http://194.47.174.64:8000/job/buildRandomRepo/buildWithParameters?token=superSecretToken&giturl=' + info.cloneUrl
        + '&studentId=' + info.studentId + '&course=' + info.courseName + '&exam=' + info.examName + '&apiurl=' + URL + '&testsurl=' + testsUrl + '/reportexam',
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          console.log(body);
        }
        // TODO: skicka feedback till slack
      }
    );
    return res.status(200);
  }
}

function format(examDoc) {
  if (examDoc === null) {
    return {
      text: 'There does not seem to be any exams for this course :smile:'
    };
  }
  let formated = {
    text: `${examDoc.name} for the course: ${examDoc.course} on <!date^${examDoc.date.valueOf() / 1000}^Posted {date_num}|Posted 2014-02-18 6:39:42 AM>`,
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

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

module.exports = new ExamController(examFacade);
