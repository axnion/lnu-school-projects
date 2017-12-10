const Controller = require('../../lib/controller');
const examFacade = require('./facade');

class ExamController extends Controller {

    createExam(req, res, next) {
        /*const timeTable = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];*/

        const input = JSON.parse(req.body.text, (key, value) => {
            return value;
        });

        const timeTable = buildTimeTable(input.duration, input.date);

        let exam = {
            course: req.body.channel_name,
            date: new Date("<" + input.date + ">"),
            name: input.name,
            timeSlots: []
        };

        for(let i = 0; i < timeTable.length; i++){
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
        console.log(inputDate);
        console.log(req.body);
        this.facade.findOne({ 'course': req.body.channel_name, 'date': { $gte : inputDate } })
            .then(doc => res.status(201).json(format(doc)))
            .catch(err => next(err));
    }
}

function format(examDoc) {
    console.log(examDoc);
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
                        //"value": "" + current.startTime.valueOf()/1000 + "-" + current.endTime,
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

function buildTimeTable(duration, date) {
    let table = [];

    //Create date and set it to 8 am
    date = new Date(date);
    date= addMinutes(date,420);
    let maxDate = addMinutes(date, 540);

    console.log(date);
    table.push(date);

    while (date < maxDate){
        date = addMinutes(date, duration);
        table.push(date);
    }

    return table;
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

module.exports = new ExamController(examFacade);
