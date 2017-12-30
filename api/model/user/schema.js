const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportExamSchema = new Schema({
    lnuUser: { type: String, required: true },
    githubUser: { type: String, required: true },
    slackUser: { type: String, required: true }
});

module.exports = mongoose.model('ReportExam', reportExamSchema);