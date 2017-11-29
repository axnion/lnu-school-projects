const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportExamSchema = new Schema({
  course: { type: String, required: true },
  studentId: { type: String, required: true },
  buildOk: { type: Boolean, required: true },
  exam: { type: String, required: true }
});

module.exports = mongoose.model('ReportExam', reportExamSchema);
