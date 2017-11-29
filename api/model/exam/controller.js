const Controller = require('../../lib/controller');
const examFacade = require('./facade');

class ExamController extends Controller {
    //TODO Add a unique exam name like examination-3
    createExam(req, res, next) {
        const timeTable = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];
        let exam = {
            course: req.body.channel_name,
            date: new Date("<" + req.body.text + ">"),
            timeSlots: []
        };

        for(let i = 0; i < timeTable.length; i++){
            exam.timeSlots.push({
                timeSlot: {
                    duration: 30,
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
        "text": "Exam for the course: " + examDoc.course + " on " + examDoc.date ,
        "attachments": []
    };

    for(let i = 0; i < examDoc.timeSlots.length - 1; i++){
        if (examDoc.timeSlots[i].timeSlot.studentId === "Available") {
            formated.attachments.push({
                "fallback": "Book your exam time",
                "title": "Book your exam time",
                "text": "" + examDoc.timeSlots[i].timeSlot.startTime + "-" + examDoc.timeSlots[i].timeSlot.endTime,
                "callback_id": "comic_1234_xyz",
                "color": "#3AA3E3",
                "attachment_type": "default",
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

module.exports = new ExamController(examFacade);
