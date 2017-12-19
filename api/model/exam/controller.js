const Controller = require('../../lib/controller');
const examFacade = require('./facade');
const request = require('request');

class ExamController extends Controller {

    /// createexamtest {"date": "2017-12-30", "name": "exam", "duration": 30, "timeSlots": 20}
    createExam(req, res, next) {
        console.log(req.headers);
        console.log(req.body);
        const input = JSON.parse(req.body.text, (key, value) => {
            return value;
        });
        console.log(req.body);

        const timeTable = buildTimeTable(input.duration, input.date, input.timeSlots);

        let exam = {
            course: req.body.channel_name,
            date: new Date("<" + input.date + ">"),
            name: input.name,
            timeSlots: []
        };
        console.log(timeTable);
        for(let i = 0; i < timeTable.length; i++){
            //TODO Implement the loop to skip forward one when going over to a new day
            // OR ask if create exam should only create one day at a time and use name + date as unique values
            if (timeTable[i] === 'skip' || timeTable[i + 1] === 'skip'){
                continue;
            }
            exam.timeSlots.push({
                timeSlot: {
                    duration: input.duration,
                    studentId: "Available",
                    startTime: timeTable[i],
                    endTime: timeTable[i + 1]
            }});
        }

        this.facade.create(exam)
            .then(doc => res.status(201).json(format(doc)))
            .catch(err => next(err));
    }

    getExam(req, res, next) {
        const inputDate = new Date(Date.now());
        this.facade.findOne({ 'course': req.body.channel_name, 'date': { $gte : inputDate } })
            .then(doc => res.status(201).json(format(doc)))
            .catch(err => next(err));
    }

    buildExam(req, res, next) {
        const input = req.body.repository;
        //console.log(req.body);
        let info = {
            repoName: input.name,
            cloneUrl: input.clone_url,
            fullName: input.full_name
        };

        request.post(
            'http://194.47.174.52:8000/job/buildRandomRepo/build?token=superSecretToken',
            { json: info },
            function (error, response, body) {
                //console.log(response);
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
            }
        );
        return res.status(200);
    }
}

function format(examDoc) {
    console.log(examDoc);
    if (examDoc === null){
        return {text: 'There does not seem to be any exams for this course :smile:'};
    }
    let formated = {
        "text": examDoc.name + " for the course: " + examDoc.course + " on " +
        "<!date^" + examDoc.date.valueOf()/ 1000 + "^Posted {date_num}|Posted 2014-02-18 6:39:42 AM>",
        "attachments": []
    };

    for(let i = 0; i < examDoc.timeSlots.length - 1; i++){
        let current = examDoc.timeSlots[i].timeSlot;
        if (current.studentId === "Available") {
            formated.attachments.push({
                "fallback": "Book your exam time",
                "title": "Book your exam time",
                "callback_id": "comic_1234_xyz",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "fields": [
                    {
                        "title": "Slot 1: " + current.studentId,
                        "value": "<!date^"+ current.startTime.valueOf()/1000 + "^{time} |8.00 AM> - "
                        + "<!date^"+ current.endTime.valueOf()/1000 + "^{time} |8.00 AM>",
                        "short": true
                    },
                    {
                        "title": "Slot 2: " + current.studentId,
                        "value": "<!date^"+ current.startTime.valueOf()/1000 + "^{time} |8.00 AM> - "
                        + "<!date^"+ current.endTime.valueOf()/1000 + "^{time} |8.00 AM>",
                        "short": true
                    }

                ],
                "actions": [
                    {
                        "name": "book",
                        "text": "Sex, Drugs & Rock&Roll",
                        "type": "button",
                        "value": "book"
                    }
                ]
            });
        }
    }

    return formated;
}

function buildTimeTable(duration, date, timeSlots) {
    let table = [];

    //Create date and set it to 8 am CET
    date = new Date(date);
    date= addMinutes(date, 420);
    let maxDate = addMinutes(date, 540);

    table.push(date);

    while (date < maxDate && table.length <= timeSlots){
        date = addMinutes(date, duration);
        table.push(date);
        console.log(date);
        if (addMinutes(date, duration) > maxDate && table.length <= timeSlots) {
            table.push('skip');

            date = addMinutes(date,duration);
            table.push(date);

            date.setDate(date.getDate() + 1);
            date.setTime(date.getTime() - (570 * 60000));

            maxDate.setDate(maxDate.getDate() + 1);
        }
    }

    return table;
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

module.exports = new ExamController(examFacade);
